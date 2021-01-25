import React, { useState } from "react";
import './App.css';



const App = () => {

  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];
  const [searchTerm, setSearchTerm] = useState("React");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }
  const searchedStories = stories.filter(story => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h1>
        Hacker Stories
      </h1>
      <Search search={searchTerm} onSearch={handleSearch} />
      <hr />
      <List list={searchedStories} />
    </div>
  );
}
const List = ({ list }) => {
  //using rest and spread operators together (first 3dots is rest, second 3dots is spread operator)
  return list.map(({ objectID, ...item }) => <Item key={objectID} {...item} />);
}
const Item = ({ title, url, author, num_comments, points }) => (
  <div>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points}</span>
  </div>
);
const Search = ({ onSearch, search }) => {

  return (
    <div>
      <label htmlFor="search">Search: </label>
      <input value={search} id="search" type="text" onChange={onSearch} />
    </div>
  );
}

export default App;
