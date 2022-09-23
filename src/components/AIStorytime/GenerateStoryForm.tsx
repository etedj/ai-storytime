import React from 'react'
import SettingsIcon from "../../resources/images/loading2.gif"

export interface IGenerateStoryFormProps {
    onClose: () => void;  
    onCreate: (title: string, author: string, subjectOfStory: string, generateCoverImage: boolean) => void;  
  }
  
 const GenerateStoryForm: React.FC<IGenerateStoryFormProps>  = ({onClose, onCreate}) => {
    const onSubmit = () => {
    
    (document.getElementById("generateStorySubmitButton") as HTMLButtonElement).disabled = true;
    document.getElementById("loadingGif")?.classList.remove("hidden");

    const title = (document.getElementById("generateStoryTitle") as HTMLInputElement)?.value;
    const author = (document.getElementById("generateStoryAuthor") as HTMLInputElement)?.value;
    const subject = (document.getElementById("generateStorySubject") as HTMLInputElement)?.value;
    onCreate(title, author, subject, true);
  }
  
  return (
    <div id="generateStoryForm" className='hidden'>
        <div className="generateStoryCloseIcon" onClick={onClose}>❌</div>
        <h2 id="generateStoryFormTitle">Generate a new Fairy Tale</h2>
        <div>
            <span className="generateStoryLabel">Title</span>
            <input type="text" id="generateStoryTitle" className="generateStoryInput"/>
        </div>
        <div>
            <span className="generateStoryLabel">Author</span>
            <input type="text" id="generateStoryAuthor" className="generateStoryInput" defaultValue="Mr. Robot" />
        </div>
        <div>
            <span className="generateStoryLabel">"Write a Fairy Tale about _________________"</span><br />
            <input type="text" id="generateStorySubject" className="generateStoryInput"/>
        </div>
        <div id="generateStorySubmitButtonDiv">
            <button id="generateStorySubmitButton" onClick={onSubmit}>Create!</button>
        </div>
        <div id="loadingGif" className="hidden">
            <img src={SettingsIcon}/>
        </div>
    </div>
  )
}

export default GenerateStoryForm