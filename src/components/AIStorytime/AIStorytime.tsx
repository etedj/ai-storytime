import BookShelf from "./BookShelf"
import OptionMenu from "./OptionMenu"
import { books, booksImg } from "../../resources/books"
import { MutableRefObject, useRef, useState } from "react"
import { SpeechConfig, AudioConfig, SpeechSynthesizer, SpeakerAudioDestination} from "microsoft-cognitiveservices-speech-sdk"
import SettingsIcon from "../../resources/images/setingsIcon.png"
import { Configuration, OpenAIApi } from "openai"
import RobotBookCover from "../../resources/images/bookCovers/robot.png"

import OpenedBook from "./OpenedBook";
import GenerateStoryForm from "./GenerateStoryForm"

const AIStorytime = () => {

    const [storyState, setStoryState] = useState({
        currentBook: -1,
        optionPromptStyle: ", digital art, Trending on ArtStation",
        optionReadingOn: true,
        optionImageGenOn: true,
        optionVoice: "en-US-AnaNeural",
        optionSpeed: 1.25,
        optionDemoModeOn: false,
        optionDebugOn: true,
        optionAutoPageTurn: false
    });
    
    let audioResumeTimeout : any = null;
    let audioEndTimeout : any = null;
    let demoModeSeed = 139;
    let seed = 0;
    
    interface imageGenRequest {
        "bookIndex": number,
        "pageIndex": number
    }

    let imageGenQueue = useRef(new Array<imageGenRequest>());
    let currentPage = useRef(-1);
    let setIntervalTimer: MutableRefObject<any> = useRef(null);
    let pageTurnTimer: MutableRefObject<any> = useRef(null);
    let fetchInProgress = useRef(false);  
    let readingFinished = useRef(false);
    let readingPage = useRef(0);
    let turnTimerStarted = useRef(false);
    
    /* Options */
    let currentBook = useRef(storyState.currentBook);
    let optionPromptStyle = useRef(storyState.optionPromptStyle);
    let optionReadingOn = storyState.optionReadingOn;
    let optionImageGenOn = useRef(storyState.optionImageGenOn);
    let optionVoice = storyState.optionVoice;
    let optionSpeed = storyState.optionSpeed;
    let optionDemoModeOn = useRef(storyState.optionDemoModeOn);
    let optionDebugOn = storyState.optionDebugOn;
    let optionAutoPageTurn = useRef(storyState.optionAutoPageTurn);
    
    let browserSound = new SpeakerAudioDestination();
    browserSound.onAudioEnd = () => {
        readingFinished.current = true;
    }

    const onPromptStyleChange = (newPromptStyle: string) => { optionPromptStyle.current = newPromptStyle; };
    const onReadingOnChange = (checked: boolean) => { 
        optionReadingOn = checked; 
        if (optionDebugOn == false) {    
            browserSound.pause();
        }
    }
    const onImageGenOnChange = (checked: boolean) => { optionImageGenOn.current = checked; }
    const onDemoModeOnChange = (checked: boolean) => { optionDemoModeOn.current = checked; }
    const onAutoPageTurn = (checked: boolean) => { optionAutoPageTurn.current = checked; }
    const onVoiceChange = (newVoice: string) => { optionVoice = newVoice; }
    const onSpeedChange = (newSpeed: number) => { 
        optionSpeed = newSpeed; 
        browserSound.internalAudio.playbackRate = optionSpeed
    }
    const onDebugOnChange = (checked: boolean) => { 
        optionDebugOn = checked; 
        if (optionDebugOn) {
            document.getElementById("debugBar")?.classList.remove("hidden");
        }
        else {
            document.getElementById("debugBar")?.classList.add("hidden");
        }
    }

    const generateStoryButtonPressed = () => {
        document.getElementById("generateStoryForm")?.classList.remove("hidden");
        document.getElementById("generateStoryButton")?.classList.add("hidden");
        
    }
    const onGenerateStoryFormClose = () => {
        document.getElementById("generateStoryForm")?.classList.add("hidden");
        document.getElementById("generateStoryButton")?.classList.remove("hidden");
    }

    const addBookAndClosePrompt = (title: string, author: string, bookContents: string, coverImg : string) => {
        let pages = bookContents.split(".")

        // Combine Sentences so there are 2 sentences per page
        let tempStr = "";
        let newPages = [];
        for (let i = 0; i < pages.length; i++) {
            if (tempStr === "") {
                tempStr = pages[i] + ". ";
            }
            else {
                if (tempStr.trim().length > 2) {
                    tempStr += pages[i] + ".";
                }
                newPages.push(tempStr);
                tempStr = "";
            }
        }
        if (tempStr.trim().length > 2) {
            newPages.push(tempStr);
        }

        // Add New Book + Image
        books.push({
            Title: title,
            Author: author,
            Pages: newPages
        })
        booksImg.push(coverImg);

        // Close and Enable button
        document.getElementById("loadingGif")?.classList.add("hidden");
        (document.getElementById("generateStorySubmitButton") as HTMLButtonElement).disabled = false;
        document.getElementById("generateStoryForm")?.classList.add("hidden");
        document.getElementById("generateStoryButton")?.classList.remove("hidden");

        // reload
        setCurrentBook(-1);
    }
    

    const onGenerateStoryFormSubmit = (subjectOfStory: string) => {
        const configuration = new Configuration({
            apiKey: (document.getElementById("OpenAIKey") as HTMLInputElement).value,
          });
          const openai = new OpenAIApi(configuration);

          // Get Book Text
          const response = openai.createCompletion({
            model: "text-davinci-002",
            prompt: "Write a fairy tale about " +  subjectOfStory,
            temperature: 0.9,
            max_tokens: 1000,
          }).
          then((response) => {
            console.log(response);

            let bookContents = response?.data?.choices?.at(0)?.text;

            // Get Book Title
            const titleResponse = openai.createCompletion({
                model: "text-davinci-002",
                prompt: "Write a title for this story: \"" +  bookContents + "\"",
                temperature: 0.9,
                max_tokens: 20,
              }).
              then((response) => {
                console.log(response);
    
                let bookTitle = response?.data?.choices?.at(0)?.text ?? "ERROR";
        
                let coverImageUrl = RobotBookCover;

                fetch("http://"+(document.getElementById("StableDiffusionURL") as HTMLInputElement).value+"/image", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( {
                        "prompt": bookTitle + ", Fantasy Book Cover, Trending on ArtStation",
                        "num_outputs": 1,
                        "num_inference_steps": "50",
                        "guidance_scale": "7.5",
                        "width": "384",
                        "height": "512",
                        "turbo": true,
                        "use_cpu": false,
                        "use_full_precision": true,
                        "seed": Math.floor(Math.random() * 99999)
                    })
                })
                .then(res => res.json())
                .then(
                (result) => {
                    coverImageUrl = result?.output?.at(0)?.data ?? RobotBookCover;
                    fetchInProgress.current = false;
                    addBookAndClosePrompt(bookTitle, "Storytime AI", bookContents ?? "Error getting books contents", coverImageUrl);
                },
                (error) => {
                    console.log(error);        
                    fetchInProgress.current = false;
                });
            });

        });

    }

    const setCurrentBook = (bookIndex: number) => {
        currentBook.current=bookIndex;
        setStoryState({
            currentBook: bookIndex,
            optionPromptStyle: optionPromptStyle.current,
            optionReadingOn: optionReadingOn,
            optionImageGenOn: optionImageGenOn.current,
            optionVoice: optionVoice,
            optionDemoModeOn: optionDemoModeOn.current,
            optionDebugOn: optionDebugOn,
            optionAutoPageTurn: optionAutoPageTurn.current,
            optionSpeed: optionSpeed,
        })
    };

    const onDownloadClick = (bookIndex: number) => {
        const fileName = books[bookIndex].Title.replace(" ", "-");
        const saveObj = {
            book: books[bookIndex],
            bookImg: booksImg[bookIndex]
        }
        const json = JSON.stringify(saveObj, null, 4);
        const blob = new Blob([json],{type:'application/json'});
        const href = URL.createObjectURL(blob); // Create a downloadable link
        const link = document.createElement('a');       
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);   // This can any part of your website
        link.click();
        document.body.removeChild(link);
    }
    const importJsonBook = (json: string) => {
        const importedBook = JSON.parse(json);
        books.push(importedBook.book);
        booksImg.push(importedBook.bookImg);
        setCurrentBook(-1);
    }

    const tryProcessNextPicture = () => {

        // Debug
        const debugBarDiv = document.getElementById("debugBar");   
        if (debugBarDiv != null) 
            debugBarDiv.innerText = "Current Page: " + currentPage.current + ", Pages Remaining: " + imageGenQueue.current.length + ", Seed: " + seed;
        
        if (fetchInProgress.current) {
            debugBarDiv?.classList.add("fetchInProgress");
        }
        else  {
            debugBarDiv?.classList.remove("fetchInProgress");
        }

        // Handle Auto Page Turns
        if (optionAutoPageTurn.current == true &&
            readingFinished.current === true &&
            readingPage.current < currentPage.current  && 
            turnTimerStarted.current == false) {

                readingFinished.current = false;                
                turnTimerStarted.current = true;

                clearInterval(pageTurnTimer.current);
                pageTurnTimer.current = setTimeout(() => {
                    clearInterval(pageTurnTimer.current);
                    turnTimerStarted.current = false;
                
                    //@ts-ignore
                    window.flipNext();
                }, 1000);
            }

        // Are we ready to pull something off the Queue?
        if (currentBook.current !== -1 && !fetchInProgress.current && imageGenQueue.current.length > 0) {
            
            // Dequeue next prompt and process
            const nextRequest = imageGenQueue.current.shift();
            const bookIndex = nextRequest?.bookIndex ?? 0;
            const pageIndex = nextRequest?.pageIndex ?? 0;
         
            currentPage.current = (pageIndex+1)*2;
            if (optionImageGenOn.current == false) {
                const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+pageIndex);
                if (imageNode != null) {
                    imageNode.innerHTML = "<h1 class='imgGenError'>Image Generation<br>is turned OFF</h1>";
                }          
            }
            else {
                    
                debugBarDiv?.classList.add("fetchInProgress");
                fetchInProgress.current = true;

                let prompt = books[bookIndex].Pages[pageIndex].replace(/(<([^>]+)>)/ig, " ").replace(/\s+/g, ' ').trim() + optionPromptStyle.current;
            
                const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+pageIndex);
            
                seed = Math.floor(Math.random() * 99999);
                if (optionDemoModeOn.current) {
                    demoModeSeed = demoModeSeed + 1;
                    seed = demoModeSeed;
                }
        
                fetch("http://"+(document.getElementById("StableDiffusionURL") as HTMLInputElement).value+"/image", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( {
                        "prompt": prompt,
                        "num_outputs": 1,
                        "num_inference_steps": "50",
                        "guidance_scale": "7.5",
                        "width": "384",
                        "height": "512",
                        "turbo": true,
                        "use_cpu": false,
                        "use_full_precision": true,
                        "seed": seed
                    })
                })
                .then(res => res.json())
                .then(
                (result) => {
                    const imgData = result?.output.at(0)?.data;
                    if (imgData == null) {
                        if (imageNode != null) {
                            imageNode.innerHTML = "<h1 class='imgGenError'>Error. No image data.</h1>";
                        }
                    }
                    else {
                        if (imageNode != null) {
                            imageNode.innerHTML = "<img class='ai-image' src='"+imgData+"' />";
                        }
                    }
                    fetchInProgress.current = false;
                },
                (error) => {
                    console.log(error);        
                    fetchInProgress.current = false;
                    if (imageNode != null) {
                        imageNode.innerHTML = "<h1 class='imgGenError'>Error</h1>"+error;
                    }
                }) 
            }
        }
    };
    const reloadImage = (bookIndex: number, pageIndex: number) => {
        // Replace Image with Placeholder
        const imageNode = document.getElementById("imageForBook"+bookIndex+"Page"+pageIndex);
        if (imageNode != null) {
            imageNode.innerHTML = "<h1>Loading...</h1>";
        }
        // Add to Front of Queue
        imageGenQueue.current.unshift({ "bookIndex": bookIndex, "pageIndex": pageIndex });  
    }


    const readPage = (pageNumber: number) => {
        clearInterval(pageTurnTimer.current);
        readingPage.current = pageNumber;

        readingFinished.current = false;
        browserSound.pause();
        clearTimeout(audioResumeTimeout);
        
        //const textToRead = document.getElementById("bookPage"+pageNumber)?.textContent ?? "";
        const textToRead = (document.getElementById("bookPage"+pageNumber)?.innerHTML ?? "")
            .replace(/<h2>.*<\/h2>/ig, " ") // Remove Headings in Mother Goose
            .replace(/(<([^>]+)>)/ig, " ").replace(/\s+/g, ' ').trim();
        if (optionReadingOn)
        {
            // Timeout is to prevent reading while quickly flipping through page
            // You must be on the page for a full second before reading starts
            audioResumeTimeout = setTimeout( () => {
                browserSound = new SpeakerAudioDestination();               
                                
                browserSound.onAudioStart = () => {
                    console.log("Reading Started");
                    browserSound.internalAudio.playbackRate = optionSpeed;
                    browserSound.internalAudio.ontimeupdate = () => {
                        clearTimeout(audioEndTimeout);
                        audioEndTimeout = setTimeout(()=> {
                            readingFinished.current = true;
                            console.log("Done Reading");
                            browserSound.internalAudio.ontimeupdate = null;
                        }, 1000);
                    }
                }
                const speechConfig = SpeechConfig.fromSubscription((document.getElementById("AzureKey") as HTMLInputElement).value, "westus");
                const audioConfig = AudioConfig.fromSpeakerOutput(browserSound);
                speechConfig.speechSynthesisVoiceName = optionVoice; 
                const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
                synthesizer.speakTextAsync(textToRead, () => {
                });
            }, 1000);
        }
    }

    const closeBook = () => {
        readingPage.current = 0;
        if (storyState.currentBook === -1) {
            return;
        }        
        imageGenQueue.current = [];
        const openedBook = document.getElementsByClassName("openedBook")[0];
        openedBook.classList.add("hide");
        fetch("http://"+(document.getElementById("StableDiffusionURL") as HTMLInputElement).value+"/image/stop");
        
        readingFinished.current = false;
        
        // Stop Timer
        clearInterval(setIntervalTimer.current);
        setIntervalTimer.current = null;

        // Timeout is for animation purposes
        setTimeout( () => {
            setCurrentBook(-1);
        }, 500);       
        
        currentPage.current = -1;
        const openedCard = document.getElementsByClassName("opened")[0] as HTMLDivElement;
        openedCard.classList.remove("opened");
        //TODO: Add third state to smoothly return to right location
        browserSound.pause();
        clearTimeout(audioResumeTimeout);
    }

    const onMouseClickCover = (event  : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!event.currentTarget.classList.contains("opened")) {
            event.currentTarget.style.left = ""+event.currentTarget.getBoundingClientRect().left+"px";
            event.currentTarget.style.top = ""+event.currentTarget.getBoundingClientRect().top+"px";

            event.currentTarget.classList.add("opened");
            event.currentTarget.style.left = "";
            event.currentTarget.style.top = "";
            let bookIndex = parseInt(event.currentTarget.getAttribute("book-index") as string ?? "0");

            // Timeout is for animation purposes
            setTimeout(() => {
                setCurrentBook(bookIndex);
                
                if (setIntervalTimer.current == null)
                {
                    console.log("Creating a setInterval timer.");
                    setIntervalTimer.current = setInterval(tryProcessNextPicture, 100);
                }
                
            }, 2000);            
        }
    }

    const onMouseMoveOverBook = (event : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.currentTarget.style.setProperty('--x-shadow', (((window.innerWidth / 2) - event.clientX) / 20) + 'px');
        event.currentTarget.style.setProperty('--y-shadow', (((window.innerHeight / 2) - event.clientY) / 20) + 'px');
    }
        
    let debugClass = "";
    if (optionDebugOn == false)
    {
        debugClass = "hidden";
    }

    if (storyState.currentBook !== -1) 
    {
        document.body.onkeydown = (event) => {
            if (event.key == "ArrowLeft") { 
                //@ts-ignore
                window.flipPrev();
                clearInterval(pageTurnTimer.current);

            }
            else if (event.key == "ArrowRight") {
                //@ts-ignore
                window.flipNext();
                clearInterval(pageTurnTimer.current);
            }

        };
    }

    return (
        <div id="AIStoryTime">
            <div id="settingsIconDiv" onClick={()=>{ document.getElementById("optionMenu")?.classList.remove("hidden"); }}><img id="settingsIcon" src={SettingsIcon}/></div>
            <BookShelf onClickBookCover={ onMouseClickCover} onDownloadClick={onDownloadClick} />
            {
                (() => { 
                    if (storyState.currentBook !== -1) 
                    {
                        imageGenQueue.current = new Array<imageGenRequest>();
                        books[storyState.currentBook].Pages.forEach((page, index) => {
                            imageGenQueue.current.push({ "bookIndex": storyState.currentBook, "pageIndex": index });
                        });     
                        return (
                            <OpenedBook 
                                bookIndex={storyState.currentBook} 
                                onMouseMoveOverBook={onMouseMoveOverBook} 
                                onClose={closeBook} 
                                onPageTurn={readPage} 
                                onRedraw={reloadImage} />
                        )
                    }
                })()
            }
            <OptionMenu 
                onProptStyleChange={onPromptStyleChange} 
                onReadingOnChange={onReadingOnChange} 
                onImageGenOnChange={onImageGenOnChange} 
                onVoiceChange={onVoiceChange} 
                onDemoModeOnChange={onDemoModeOnChange} 
                onDebugOnChange={onDebugOnChange}
                onAutoPageTurnOnChange={onAutoPageTurn}
                onSpeedChange={onSpeedChange}
                defaultReadingOn={storyState.optionReadingOn}
                defaultImageGenOn={storyState.optionImageGenOn} 
                defaultPropertyStyle={storyState.optionPromptStyle}
                defaultVoice={storyState.optionVoice} 
                defaultDemoModeOn={storyState.optionDemoModeOn} 
                defaultDegugOn={storyState.optionDebugOn} 
                defaultAutoPageTurnOn={storyState.optionAutoPageTurn}
                defaultSpeed={storyState.optionSpeed}
                importJson = {importJsonBook} />
            <div id="debugBar" className={debugClass}></div>
            <button id="generateStoryButton" onClick={generateStoryButtonPressed}>Generate a new Fairy Tale</button>
            <GenerateStoryForm 
                onClose={onGenerateStoryFormClose} 
                onCreate={onGenerateStoryFormSubmit} />
        </div>
    )  
}

export default AIStorytime