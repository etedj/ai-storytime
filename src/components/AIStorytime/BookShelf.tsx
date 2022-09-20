import React from 'react'
import { books, booksImg } from '../../resources/books'
import Book from './Book'

export interface IBookShelfProps {
  
}

const BookShelf: React.FC<IBookShelfProps> = () => {
  return (
    <div className='book-shelf'>
      {books.map((book, index) => {
        return (
          <Book key={index} title={book.Title} author={book.Author} coverImageUrl={booksImg[index]} coverColor={book.CoverColor} pages={book.Pages} />
        )
      })
       }
    </div>
  )
}

export default BookShelf