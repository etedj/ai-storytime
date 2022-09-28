import React from 'react'
import { books, booksImg } from '../../resources/books'
import Book from './Book'

export interface IBookShelfProps {
  onClickBookCover: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;  
  onDownloadClick: (bookIndex: number) => void;
}

const BookShelf: React.FC<IBookShelfProps> = ({onClickBookCover, onDownloadClick}) => {
  return (
    <div className='book-shelf'>
      {books.map((book, index) => {
        return (
          <Book key={index} title={book.Title} author={book.Author} coverImageUrl={booksImg[index]} pages={book.Pages} index={index} onClickBookCover={onClickBookCover} onDownloadClick={onDownloadClick} />
        )
      })
       }
    </div>
  )
}

export default BookShelf