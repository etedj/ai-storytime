import BookShelf from "./BookShelf"
import OptionMenu from "./OptionMenu"
import StyleChoicePicker from "./StyleChoicePicker"
import { books, booksImg } from "../../resources/books"
import HTMLFlipBook from 'react-pageflip';
import loadingGif from '../../resources/images/pencil3.gif'

const AIStorytime = () => {

    const bookSelected = false;
    const randSeed = 0;
    const imageStyle = "";

  const pageDivs = [];
  pageDivs.push(
    <div className="bookPage" key={"cover"}>
        <img src={booksImg[0]} width="100%" height="100%" />
    </div>
  );
  pageDivs.push(
    <div className="bookPage" key={"blank"}></div>
  );
  pageDivs.push(
    <div className="bookPage" key={`title-book-${0}`}>
        <div className="titlePage">
            <h1 className="titlePageTitle">{books[0].Title}</h1>
            <h4>by {books[0].Author}</h4>
        </div>
    </div>
  );
  books[0].Pages.forEach((page, index) => {
    pageDivs.push(
        <div className="bookPage" key={"text" + index}>
            <div className="pageText"  dangerouslySetInnerHTML={{__html: page}} />
            <div className="pageNumber">{index*2+1}</div>
        </div>);
    pageDivs.push(<div className="bookPage" key={"image" + index}>
            <div className="pageImage"> 
                LOADING...<br/>
                <img src={loadingGif} width="250" />
            </div>
            <div className="pageNumber">{(index+1)*2}</div>
        </div>);
  });
  pageDivs.push(
    <div className="bookPage" key={"title"}>
        <div className="titlePage">
            <h1>THE END</h1>
        </div>
    </div>
  );

    
  const onMouseMoveOverBook = (event : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.setProperty('--x-shadow', (((window.innerWidth / 2) - event.clientX) / 20) + 'px');
    event.currentTarget.style.setProperty('--y-shadow', (((window.innerHeight / 2) - event.clientY) / 20) + 'px');
  }

//<OptionMenu />
//<StyleChoicePicker />
        
  return (
    <div>
        <BookShelf />
        <div className="openedBook" onMouseMove={onMouseMoveOverBook}>
            <HTMLFlipBook 
                width={631}
                height={855}
                className={'test'} 
                style={{ margin: 'auto auto' }} 
                startPage={0} 
                size={'stretch'} 
                minWidth={631}
                maxWidth={631}
                minHeight={855}
                maxHeight={855}
                drawShadow={false} 
                flippingTime={700} 
                usePortrait={false} 
                startZIndex={0}
                autoSize={true} 
                maxShadowOpacity={0.4} 
                showCover={true} 
                mobileScrollSupport={false}
                clickEventForward={true} 
                useMouseEvents={true} 
                swipeDistance={100} 
                showPageCorners={false} 
                disableFlipByClick={false}
                children={pageDivs} />
        </div>
    </div>
  )
}

export default AIStorytime