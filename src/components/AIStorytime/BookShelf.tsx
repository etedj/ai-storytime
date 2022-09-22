import React from 'react'
import { books, booksImg } from '../../resources/books'
import Book from './Book'

export interface IBookShelfProps {
  onClickBookCover: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;  
}

const BookShelf: React.FC<IBookShelfProps> = ({onClickBookCover}) => {
  return (
    <div className='book-shelf'>
      {books.map((book, index) => {
        return (
          <Book key={index} title={book.Title} author={book.Author} coverImageUrl={booksImg[index]} coverColor={book.CoverColor} pages={book.Pages} index={index} onClickBookCover={onClickBookCover} />
        )
      })
       }
    </div>
  )
}

export default BookShelf