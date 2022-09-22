import React from 'react'
import HTMLFlipBook from 'react-pageflip';

export interface IBookProps {
    index: number;
    title: string;
    author: string;
    coverImageUrl: string;
    coverColor: string;
    pages: string[];
    onClickBookCover: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}


const Book: React.FC<IBookProps> = ({index, title, coverImageUrl, author, coverColor, pages, onClickBookCover}) => {
  return (
    <div className="book">
      <div className="book-card">
        <div className="book-card-cover" onClick={onClickBookCover} book-index={`${index}`}>
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