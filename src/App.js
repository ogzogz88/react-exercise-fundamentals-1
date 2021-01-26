import React, { useState, useEffect, useRef, useReducer } from "react";
import './App.css';

const initialStories = [
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

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "SET_STORIES":
      return action.payload;
    case "REMOVE_STORY":
      return state.filter(
        story => action.payload.objectID !== story.objectID
      );
    default:
      return []
  }
}

// imitate async data fetching
const getAsyncStories = () => {
  return new Promise(resolve =>
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),
      2000)
  );
}


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
  // const [stories, setStories] = useState([]); useState to useReducer
  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    []
  )
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  // simulate async data fetching
  useEffect(() => {
    setIsLoading(true);
    getAsyncStories()
      .then(result => {
        // setStories(result.data.stories); useState to useReducer
        dispatchStories({
          type: "SET_STORIES",
          payload: result.data.stories,
        })
        setIsLoading(false);
      })
      .catch(() => setIsError(true));

  }, []);

  const handleRemoveStory = (item) => {
    // useState to useReducer
    // const newStories = stories.filter(
    //   story => item.objectID !== story.objectID
    // );
    // setStories(newStories); 
    dispatchStories({
      type: "REMOVE_STORIES",
      payload: item,
    })
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }
  const searchedStories = stories.filter(story => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  return (
    <div>
      <h1>Hacker Stories</h1>
      {/* using composition inside InputWithLabelComponent (using it like a html element by the help of children prop)*/}
      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={handleSearch}
        isFocused//default to true, isFocused EQUALS isFocused = {true}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />
      {isError && <p>Something went wrong ...</p>}
      {/* adding coditional rendering */}
      {isLoading ?
        (<p>Loading...</p>) :
        (
          <List
            list={searchedStories}
            onRemoveItem={handleRemoveStory}
          />
        )
      }
    </div>
  );
}
const List = ({ list, onRemoveItem }) => {
  //using rest and spread operators together (first 3dots is rest, second 3dots is spread operator)
  //return list.map(({ objectID, ...item }) => <Item key={objectID} {...item} onRemoveItem={onRemoveItem} />);
  return list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ))
}

const Item = ({ item, onRemoveItem }) => {
  //executing item remove in the classical way
  const handleRemoveItem = () => onRemoveItem(item);

  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        {/* executing item remove in the classical way
      <button type="button" onClick={handleRemoveItem}> */}

        {/* using inline handler by the help of arrow functions */}
        {/* avoid complex logic here!, one function to execute is enough */}
        <button type="button" onClick={() => handleRemoveItem(item)}>
          Dismiss
        </button>
      </span>

    </div>
  );
};

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
  const inputRef = useRef();
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  return (
    <>
      <label htmlFor={id}>{children} </label>
      &nbsp;
      <input
        ref={inputRef}
        value={value}
        id={id}
        type={type}
        onChange={onInputChange}
        autoFocus={isFocused}
      //add auto focus declaretively
      //autoFocus
      />
    </>
  );
}

export default App;
