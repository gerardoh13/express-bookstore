const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let b1 = {
  isbn: "0691161518",
  amazon_url: "http://a.co/eobPtX2",
  author: "Matthew Lane",
  language: "english",
  pages: 264,
  publisher: "Princeton University Press",
  title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  year: 2017,
};

describe("Book Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");
  });

  /** POST /books => {book: newBook}  */

  describe("POST /books", function () {
    test("can add a book", async function () {
      let response = await request(app).post("/books").send(b1);

      let book = response.body.book;
      expect(book.year).toEqual(2017);
      expect(response.statusCode).toEqual(201);
    });

    test("won't add book w/missing data", async function () {
      let response = await request(app).post("/books").send({});
      expect(response.statusCode).toEqual(400);
    });

    test("won't add book w/ bad data type", async function () {
      let badBook = { ...b1 };
      badBook.year = "2017";
      let response = await request(app).post("/books").send(badBook);
      expect(response.statusCode).toEqual(400);
      expect(response.body.error.message[0]).toEqual(
        "instance.year is not of a type(s) integer"
      );
    });
  });
  /** PUT /books/:isbn => {book: updated book}  */

  describe("PUT /books", function () {
    test("can update a book", async function () {
      await Book.create(b1);
      let response = await request(app).put("/books/0691161518").send({
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "french",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2019,
      });
      let updatedBook = response.body.book;
      expect(updatedBook.year).toEqual(2019);
      expect(updatedBook.language).toEqual("french");
      expect(response.statusCode).toEqual(200);
    });

    test("won't update book w/missing data", async function () {
      await Book.create(b1);
      let response = await request(app).put("/books/0691161518").send({});
      expect(response.statusCode).toEqual(400);
    });

    test("won't update book w/bad data type", async function () {
      await Book.create(b1);
      let response = await request(app).put("/books/0691161518").send({
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "french",
        pages: "264",
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2019,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error.message[0]).toEqual(
        "instance.pages is not of a type(s) integer"
      );
    });
  });

  /** PATCH /books/:isbn => {book: updated book}  */

  describe("PATCH /books", function () {
    test("can partially update a book", async function () {
      await Book.create(b1);
      let response = await request(app).patch("/books/0691161518").send({
        author: "Sam the Cat",
        publisher: "Cat University Press",
      });
      let updatedBook = response.body.book;
      console.log("updated*****************************", updatedBook.author);
      expect(updatedBook.author).toEqual("Sam the Cat");
      expect(updatedBook.publisher).toEqual("Cat University Press");
      expect(response.statusCode).toEqual(200);
    });

    test("won't patch book w/missing data", async function () {
      await Book.create(b1);
      let response = await request(app).patch("/books/0691161518").send({
        pages: "264",
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error.message[0]).toEqual(
        "instance.pages is not of a type(s) integer"
      );
    });
  });

  /** GET /books/:isbn => {book: book}  */

  describe("GET /books/:isbn", function () {
    test("can get a specific book", async function () {
      await Book.create(b1);
      let response = await request(app).get("/books/0691161518");
      let book = response.body.book;
      expect(response.statusCode).toEqual(200);
      expect(book).toEqual(b1);
    });
  });

  /** GET /books => {books: [book, ...]}  */

  describe("GET /books", function () {
    test("can get all books", async function () {
      await Book.create(b1);
      let response = await request(app).get("/books");
      let books = response.body.books;
      expect(response.statusCode).toEqual(200);
      expect(books).toEqual([b1]);
    });
  });

});

afterAll(async function () {
  await db.end();
});
