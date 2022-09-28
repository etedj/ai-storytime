import React from 'react'

export interface IBookProps {
    index: number;
    title: string;
    author: string;
    coverImageUrl: string;
    pages: string[];
    onClickBookCover: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onDownloadClick: (bookIndex: number) => void;
}


const Book: React.FC<IBookProps> = ({index, title, coverImageUrl, author,  pages, onClickBookCover, onDownloadClick}) => {
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
        {
          (() => {
            if (index > 4)
            {
              return (<div className="downloadDiv">
                <button className="downloadBtn" onClick={() => onDownloadClick(index)}>⭳</button>
            </div>)
            }
          })()
       }
      </div>
    </div>
  )
}

export default Book