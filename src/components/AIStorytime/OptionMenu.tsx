import React from 'react'
import { voices } from '../../resources/voices';
import { promptStypes } from '../../resources/promptStyles';

export interface IOptionMenufProps {
  onProptStyleChange: (newPromptStyle: string) => void;  
  onReadingOnChange: (checked: boolean) => void;  
  onImageGenOnChange: (checked: boolean) => void;  
  onVoiceChange: (voice: string) => void;
  defaultReadingOn: boolean,
  defaultImageGenOn: boolean,
  defaultPropertyStyle: string,
  defaultVoice: string
}

const OptionMenu: React.FC<IOptionMenufProps> = ({onProptStyleChange, onReadingOnChange, onImageGenOnChange, onVoiceChange, defaultReadingOn, defaultImageGenOn, defaultPropertyStyle, defaultVoice}) => {
  
  const onClickPromptStyle = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, promptStyle: string) => {
    document.getElementsByClassName("selectedPromptStyle")[0].classList.remove("selectedPromptStyle");
    event.currentTarget.classList.add("selectedPromptStyle");
    onProptStyleChange(promptStyle);
  }

  return (
    <div className="optionMenu">
      <h1>OPTIONS</h1>
    
      <div className="option">
        <div className="optionLabel">Image Generation</div>
        <label className="toggler-wrapper style-15">
            <input type="checkbox" defaultChecked={defaultImageGenOn} onChange={(e) => { onImageGenOnChange(e.currentTarget.checked) }} />
            <div className="toggler-slider">
                <div className="toggler-knob"></div>
            </div>
        </label>
      </div>

      <div className="option">
        <div className="optionLabel">Read Aloud</div>
        <label className="toggler-wrapper style-15">
            <input type="checkbox"  defaultChecked={defaultReadingOn} onChange={(e) => { onReadingOnChange(e.currentTarget.checked) }} />
            <div className="toggler-slider">
                <div className="toggler-knob"></div>
            </div>
        </label>
      </div>

      <div className="option">
        <div className="optionLabel">Reading Voice: </div>
        <select id="voiceDropdown" defaultValue={defaultVoice} onChange={(e)=>{ onVoiceChange(e.currentTarget.value) }}>
          {voices.map((voice, index) => {
              return (<option key={"voice"+index} value={voice.Value}>{voice.DisplayName}</option>)
          })}          
        </select>
      </div>

      <div className="stylePicker">
        <div className="stylePickerLabel">Choose an Art Style</div>
        <div className="styleOptions">
        {
          promptStypes.map((promptStyle, index) => {
            if (promptStyle.Value == defaultPropertyStyle) {  
              return (
                <div key={"promptStyle"+index} className="promptStyle selectedPromptStyle" onClick={(event) => { onClickPromptStyle(event, promptStyle.Value)}}>
                  <img className="promptStyleImg" src={promptStyle.Image}></img>
                  <div className="promptStyleLabel">{promptStyle.DisplayName}</div>
                </div>
              )
            }
            else {  
              return (
                <div key={"promptStyle"+index} className="promptStyle" onClick={(event) => { onClickPromptStyle(event, promptStyle.Value)}}>
                  <img className="promptStyleImg" src={promptStyle.Image}></img>
                  <div className="promptStyleLabel">{promptStyle.DisplayName}</div>
                </div>
              )
            }
          })
        }
            
        </div>
      </div>

    </div>
    
  )
}

export default OptionMenu