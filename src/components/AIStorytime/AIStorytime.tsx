import BookShelf from "./BookShelf"
import OptionMenu from "./OptionMenu"
import { books, booksImg } from "../../resources/books"
import { useState } from "react"
import { SpeechConfig, AudioConfig, SpeechSynthesizer, SpeakerAudioDestination} from "microsoft-cognitiveservices-speech-sdk"
import SettingsIcon from "../../resources/images/setingsIcon.png"

import OpenedBook from "./OpenedBook";

const AIStorytime = () => {

    const [storyState, setStoryState] = useState({
        currentBook: -1,
        optionPromptStyle: ", digital art, Trending on ArtStation",
        optionReadingOn: true,
        optionImageGenOn: true,
        optionVoice: "en-US-AnaNeural"
    });

    let randSeed = 0;
    
    let fetchInProgresss = false;
    let audioResumeTimeout : any = null;

    /* Options */
    let optionPromptStyle = storyState.optionPromptStyle;
    let optionReadingOn = storyState.optionReadingOn;
    let optionImageGenOn = storyState.optionImageGenOn;
    let optionVoice = storyState.optionVoice;

    let browserSound = new SpeakerAudioDestination();

    const onPromptStyleChange = (newPromptStyle: string) => { optionPromptStyle = newPromptStyle; };
    const onReadingOnChange = (checked: boolean) => { optionReadingOn = checked; }
    const onImageGenOnChange = (checked: boolean) => { optionImageGenOn = checked; }
    const onVoiceChange = (newVoice: string) => { optionVoice = newVoice; }

    const setCurrentBook = (bookIndex: number) => {
        setStoryState({
            currentBook: bookIndex,
            optionPromptStyle: optionPromptStyle,
            optionReadingOn: optionReadingOn,
            optionImageGenOn: optionImageGenOn,
            optionVoice: optionVoice
        })
    };

    const pageTurn = (pageNumber: number) => {
        browserSound.pause();
        clearTimeout(audioResumeTimeout);
        const textToRead = document.getElementById("bookPage"+pageNumber)?.textContent ?? "";
        if (optionReadingOn)
        {
            audioResumeTimeout = setTimeout( () => {
                browserSound = new SpeakerAudioDestination();
                const speechConfig = SpeechConfig.fromSubscription("todo", "westus");
                const audioConfig = AudioConfig.fromSpeakerOutput(browserSound);
                speechConfig.speechSynthesisVoiceName = optionVoice; 
                const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
                synthesizer.speakTextAsync(textToRead);
            }, 1000);
        }
    }

    const closeBook = () => {
        if (storyState.currentBook === -1) {
            return;
        }
        const openedBook = document.getElementsByClassName("openedBook")[0];
        openedBook.classList.add("hide");

        fetch("http://shantell-pc:9000/image/stop");

        setTimeout( () => {
            setCurrentBook(-1);
        }, 500);
        
        setTimeout( () => {
            const openedCard = document.getElementsByClassName("opened")[0];
            //TODO: Add third state to smoothly return to right location
            openedCard.classList.remove("opened");
        }, 0);

        browserSound.pause();
    }

    const onMouseClickCover = (event  : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!event.currentTarget.classList.contains("opened")) {
            if (fetchInProgresss) {
                return;
            }
            event.currentTarget.style.left = ""+event.currentTarget.getBoundingClientRect().left+"px";
            event.currentTarget.style.top = ""+event.currentTarget.getBoundingClientRect().top+"px";

            event.currentTarget.classList.add("opened");
            event.currentTarget.style.left = "";
            event.currentTarget.style.top = "";
            let bookIndex = parseInt(event.currentTarget.getAttribute("book-index") as string ?? "0");

            setTimeout(() => {
                setCurrentBook(bookIndex);
            }, 2000);            

            LoadNextPicture(bookIndex, 0);
        }
    }

    const onMouseMoveOverBook = (event : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.currentTarget.style.setProperty('--x-shadow', (((window.innerWidth / 2) - event.clientX) / 20) + 'px');
        event.currentTarget.style.setProperty('--y-shadow', (((window.innerHeight / 2) - event.clientY) / 20) + 'px');
    }

    const setPicture = (bookIndex: number, picIndexToLoad: number, status: string, image: any) => {
        // TODO
    }

    const loadPicture = (bookIndex: number, picIndexToLoad: number) => {
        
        if (fetchInProgresss) {
            return;
        }
        fetchInProgresss = true;

        const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+picIndexToLoad);
        if (imageNode != null) {
            imageNode.innerHTML = "<h1'>Loading...</h1>";
        }

        let prompt1 = books[bookIndex].Pages[picIndexToLoad].replace(/(<([^>]+)>)/ig, " ").replace(/\s+/g, ' ').trim() + optionPromptStyle;
        fetch("http://shantell-pc:9000/image", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                "prompt": prompt1,
                "num_outputs": 1,
                "num_inference_steps": "50",
                "guidance_scale": "7.5",
                "width": "384",
                "height": "512",
                "turbo": true,
                "use_cpu": false,
                "use_full_precision": true,
                "save_to_disk_path": "C:\\Users\\erict\\Stable Diffusion UI",
                "seed": randSeed == 0 ? Math.floor(Math.random() * 9999) : randSeed
            })
        })
        .then(res => res.json())
        .then(
        (result) => {
            const imgData = result.output[0].data;
            const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+picIndexToLoad);
            if (imageNode != null) {
                imageNode.innerHTML = "<img class='ai-image' src='"+imgData+"' />";
            }
            picIndexToLoad++;
            fetchInProgresss = false;
        },
        (error) => {
            console.log(error);        
            fetchInProgresss = false;
            const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+picIndexToLoad);
            if (imageNode != null) {
                imageNode.innerHTML = "<h1 class='imgGenError'>Error</h1>"+error;
            }
        })    
    }

    function LoadNextPicture(bookIndex: number, picIndexToLoad: number) {

        if (fetchInProgresss) {
            return;
        }

        if (optionImageGenOn == false) {
            setTimeout(() => {
                const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+picIndexToLoad);
                if (imageNode != null) {
                    imageNode.innerHTML = "<h1 class='imgGenError'>Image Generation<br>is turned OFF</h1>";
                }
            }, 5000);   
            
            return;
        }

        fetchInProgresss = true;

        let prompt1 = books[bookIndex].Pages[picIndexToLoad].replace(/(<([^>]+)>)/ig, " ").replace(/\s+/g, ' ').trim() + optionPromptStyle;
        fetch("http://shantell-pc:9000/image", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                "prompt": prompt1,
                "num_outputs": 1,
                "num_inference_steps": "50",
                "guidance_scale": "7.5",
                "width": "384",
                "height": "512",
                "turbo": true,
                "use_cpu": false,
                "use_full_precision": true,
                "save_to_disk_path": "C:\\Users\\erict\\Stable Diffusion UI",
                "seed": randSeed == 0 ? Math.floor(Math.random() * 9999) : randSeed
            })
        })
        .then(res => res.json())
        .then(
        (result) => {
            const imgData = result.output[0].data;
            const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+picIndexToLoad);
            if (imageNode != null) {
                imageNode.innerHTML = "<img class='ai-image' src='"+imgData+"' />";
            }
            picIndexToLoad++;
            fetchInProgresss = false;
            if (picIndexToLoad < books[bookIndex].Pages.length) {
                
                const openedBookDiv = document.getElementById("openedBook");
                let bookIndexCurrent = parseInt(openedBookDiv?.getAttribute("book-index") as string ?? "-1");
                if (bookIndex === bookIndexCurrent) {
                    LoadNextPicture(bookIndex, picIndexToLoad);
                }
            }
        },
        (error) => {
            console.log(error);        
            fetchInProgresss = false;
            const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+picIndexToLoad);
            if (imageNode != null) {
                imageNode.innerHTML = "<h1 class='imgGenError'>Error</h1>"+error;
            }
        })    
    }
        
    if (storyState.currentBook !== -1) 
    {
        return (
            <div id="AIStoryTime">
                <div id="settingsIconDiv" onClick={()=>{ document.getElementById("optionMenu")?.classList.remove("hidden"); }}><img id="settingsIcon" src={SettingsIcon}/></div>
                <BookShelf onClickBookCover={ onMouseClickCover } />
                <OpenedBook bookIndex={storyState.currentBook} onMouseMoveOverBook={onMouseMoveOverBook} onClose={closeBook} onPageTurn={pageTurn} onRedraw={loadPicture} />
                <OptionMenu 
                    onProptStyleChange={onPromptStyleChange} 
                    onReadingOnChange={onReadingOnChange} 
                    onImageGenOnChange={onImageGenOnChange} 
                    onVoiceChange={onVoiceChange} 
                    defaultReadingOn={storyState.optionReadingOn}
                    defaultImageGenOn={storyState.optionImageGenOn} 
                    defaultPropertyStyle={storyState.optionPromptStyle}
                    defaultVoice={storyState.optionVoice} />
            </div>
        )
    } 
    else {
        return (
            <div id="AIStoryTime">
                <div id="settingsIconDiv" onClick={()=>{ document.getElementById("optionMenu")?.classList.remove("hidden"); }}><img id="settingsIcon" src={SettingsIcon}/></div>
                <BookShelf onClickBookCover={ onMouseClickCover } />
                <OptionMenu 
                    onProptStyleChange={onPromptStyleChange} 
                    onReadingOnChange={onReadingOnChange} 
                    onImageGenOnChange={onImageGenOnChange} 
                    onVoiceChange={onVoiceChange} 
                    defaultReadingOn={storyState.optionReadingOn}
                    defaultImageGenOn={storyState.optionImageGenOn} 
                    defaultPropertyStyle={storyState.optionPromptStyle}
                    defaultVoice={storyState.optionVoice} />
            </div>
        )
    }
}

export default AIStorytime