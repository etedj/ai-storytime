import React from 'react'
import HTMLFlipBook from 'react-pageflip';

export interface IBookProps {
   title: string;
   author: string;
   coverImageUrl: string;
   coverColor: string;
   pages: string[];
}


const Book: React.FC<IBookProps> = ({title, coverImageUrl, author, coverColor, pages}) => {

  const handleButtonClick = (event : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.currentTarget.classList.contains("opened")) {
      event.currentTarget.classList.remove("opened");
    }
    else {
      event.currentTarget.style.left = ""+event.currentTarget.getBoundingClientRect().left+"px";
      event.currentTarget.style.top = ""+event.currentTarget.getBoundingClientRect().top+"px";
      event.currentTarget.classList.add("opened");
      event.currentTarget.style.left = "";
      event.currentTarget.style.top = "";
    }
  }

  return (
    <div className="book">
      <div className="book-card">
        <div className="book-card-cover" onClick={handleButtonClick}>
          <div className="book-card-book">
            <div className="book-card-book-front">
              <img className="book-card-img" src={coverImageUrl} />
            </div>
            <div className="book-card-book-back"></div>
            <div className="book-card-book-side"></div>
          </div>
        </div>
        <div>
          <div className="book-card-title">
            {title}
          </div>
          <div className="book-card-author">
            {author}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Book