import React, { useState, useEffect } from "react";
import './App.css';

// using custom hook, name is useSemiPersistentState just because it uses localStorage, and deleting localStorage may change the state
// custom hook name convention: use + UpperCase name
// return values must be an array of values
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );
  // seperate the side effect(setting a value to localstorage)
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
}

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }
  const searchedStories = stories.filter(story => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  return (
    <div>
      <h1>Hacker Stories</h1>
      <InputWithLabel
        id="search"
        label="Search"
        value={searchTerm}
        onInputChange={handleSearch}
      />
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

const InputWithLabel = ({ id, label, value, type = 'text', onInputChange }) => (
  <>
    <label htmlFor={id}>{label}: </label>
  &nbsp;
    <input
      value={value}
      id={id}
      type={type}
      onChange={onInputChange}
    />
  </>
)

export default App;
