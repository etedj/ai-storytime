import React from 'react'
import { voices } from '../../resources/voices';
import { promptStypes } from '../../resources/promptStyles';

export interface IOptionMenuProps {
  onProptStyleChange: (newPromptStyle: string) => void;  
  onReadingOnChange: (checked: boolean) => void;  
  onImageGenOnChange: (checked: boolean) => void;  
  onDemoModeOnChange: (checked: boolean) => void;  
  onDebugOnChange: (checked: boolean) => void;  
  onVoiceChange: (voice: string) => void;
  onSpeedChange: (speed: number) => void;
  onAutoPageTurnOnChange: (checked: boolean) => void;  
  defaultReadingOn: boolean,
  defaultImageGenOn: boolean,
  defaultPropertyStyle: string,
  defaultVoice: string
  defaultSpeed: number
  defaultDemoModeOn: boolean
  defaultDegugOn: boolean
  defaultAutoPageTurnOn: boolean
  importJson: (json:string) => void;
}

const OptionMenu: React.FC<IOptionMenuProps> = ({onProptStyleChange, onReadingOnChange, onImageGenOnChange, onVoiceChange, onDemoModeOnChange, onDebugOnChange, onAutoPageTurnOnChange, onSpeedChange, defaultReadingOn, defaultImageGenOn, defaultPropertyStyle, defaultVoice, defaultDemoModeOn, defaultDegugOn, defaultAutoPageTurnOn, defaultSpeed, importJson}) => {
  
  const onClickPromptStyle = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, promptStyle: string) => {
    document.getElementsByClassName("selectedPromptStyle")[0].classList.remove("selectedPromptStyle");
    event.currentTarget.classList.add("selectedPromptStyle");
    onProptStyleChange(promptStyle);
  }

  return (
    <div id="optionMenu" className="optionMenu hidden">
      <div className="optionsCloseIcon" onClick={()=>{
        document.getElementById("optionMenu")?.classList.add("hidden");
      }}>❌</div>
      <h1>Options</h1>
    
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
        <div className="optionLabel">Auto Page Turns</div>
        <label className="toggler-wrapper style-15">
            <input type="checkbox"  defaultChecked={defaultAutoPageTurnOn} onChange={(e) => { onAutoPageTurnOnChange(e.currentTarget.checked) }} />
            <div className="toggler-slider">
                <div className="toggler-knob"></div>
            </div>
        </label>
      </div>

      <div className="option">
        <div className="optionLabel">Reading Voice</div>
        <select id="voiceDropdown" defaultValue={defaultVoice} onChange={(e)=>{ onVoiceChange(e.currentTarget.value) }}>
          {voices.map((voice, index) => {
              return (<option key={"voice"+index} value={voice.Value}>{voice.DisplayName}</option>)
          })}          
        </select>
      </div>

      <div className="option">
        <div className="optionLabel">Reading Speed</div>
        <input type="range" defaultValue={defaultSpeed} min="1.0" max="3.0" step="0.25" onChange={(e) => {
          const speed = e.currentTarget.value;
          //@ts-ignore
          document.getElementById("speedValue").innerText = speed;
          onSpeedChange(parseFloat(speed));
        }} />
        <span id="speedValue">{defaultSpeed}</span>
      </div>

      <div className="option">
        <div className="optionLabel">Demo Mode</div>
        <label className="toggler-wrapper style-15">
            <input type="checkbox"  defaultChecked={defaultDemoModeOn} onChange={(e) => { onDemoModeOnChange(e.currentTarget.checked) }} />
            <div className="toggler-slider">
                <div className="toggler-knob"></div>
            </div>
        </label>
      </div>

      <div className="option">
        <div className="optionLabel">Debug Mode</div>
        <label className="toggler-wrapper style-15">
            <input type="checkbox"  defaultChecked={defaultDegugOn} onChange={(e) => { onDebugOnChange(e.currentTarget.checked) }} />
            <div className="toggler-slider">
                <div className="toggler-knob"></div>
            </div>
        </label>
      </div>

      <div className="stylePicker">
        <div className="stylePickerLabel">Select Art Style</div>
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
      
      <div className="option">
        <div className="optionLabel">Upload Book</div>
        <input type="file" accept=".json" onChange={(event) => {
            event?.currentTarget?.files?.item(0)?.text().then((fileContents)=>{
              importJson(fileContents);
            })
        }}></input>
      </div>

      <details>
        <summary>Configuration</summary>
        StableDiffusion URL: <br/><input type="text" id="StableDiffusionURL" defaultValue="" /><br/>
        OpenAI Key: <br/><input type="text" id="OpenAIKey" defaultValue="" /> <br/>
        Azure Key: <br/><input type="text" id="AzureKey" defaultValue="" /><br/>
      </details>

    </div>
    
  )
}

export default OptionMenu