import { books, booksImg } from "../../resources/books"
import loadingGif from '../../resources/images/pencil3.gif'
import HTMLFlipBook from 'react-pageflip';

export interface IOpenedBookProps {
    bookIndex: number
    onMouseMoveOverBook: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onClose: () => void
    onPageTurn: (pageNumber: number) => void
    onRedraw: (bookIndex: number, picIndexToLoad: number) => void
}

const OpenedBook: React.FC<IOpenedBookProps> = ({bookIndex, onMouseMoveOverBook, onClose, onPageTurn, onRedraw }) => {

    let pageFlip: any = null;
    
    //@ts-ignore
    window.flipNext = () => {
        pageFlip.pageFlip().flipNext('bottom');
    }
    //@ts-ignore
    window.flipPrev = () => {
        pageFlip.pageFlip().flipPrev('bottom');
    }

    const pageDivs = [];
    pageDivs.push(
    <div className="bookPage" key={"cover"}>
        <img src={booksImg[bookIndex]} width="100%" height="100%" />
    </div>
    );
    pageDivs.push(
    <div className="bookPage" key={"blank"}></div>
    );
    pageDivs.push(
    <div className="bookPage" key={`title-book-${bookIndex}`}>
        <div className="titlePage" id="bookPage1" >
            <h1 className="titlePageTitle">{books[bookIndex].Title}</h1>
            <h4> by {books[bookIndex].Author}</h4>
        </div>
    </div>
    );
    books[bookIndex].Pages.forEach((page, index) => {
    pageDivs.push(
        <div className="bookPage" key={"text" + index}>
            <div className="pageText" id={"bookPage"+(index*2+3)}  dangerouslySetInnerHTML={{__html: page}} />
            <div className="pageNumber">{index*2+1}</div>
        </div>);
    pageDivs.push(<div className="bookPage" key={"image" + index}>
            <div className="pageImage">
                <div id={"imageForBook" + bookIndex + "Page" + index}>
                    LOADING...<br/>
                    <img src={loadingGif} width="250" />
                </div>
                <button onClick={() => {onRedraw(bookIndex, index)}}>Redraw</button>
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


  return (
    <div className="openedBook" id="openedBook" onMouseMove={onMouseMoveOverBook} book-index={bookIndex}>
        <div className="closeIcon" onClick={onClose}>❌</div>
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
            children={pageDivs} 
            ref={(component) => (pageFlip = component)}
            onFlip={(e) => onPageTurn(e.data)} />
    </div>
  )
}

export default OpenedBook