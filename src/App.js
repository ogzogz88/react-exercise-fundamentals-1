import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";
import axios from 'axios';
import AppStyles from './App.module.css';


const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID)
      };
    default:
      throw new Error();
  }
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

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [url, setUrl] = useState(
    `${API_ENDPOINT}${searchTerm}`
  );
  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };
  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  )
  //using memoized handler, this increased performance from %46 to %55, at the lighthouse report
  const handleFetchStories = useCallback(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    axios
      .get(url)
      .then(result => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.data.hits,
        });
      })
      .catch(() =>
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, [url]); // E

  useEffect(() => {
    handleFetchStories(); // C
  }, [handleFetchStories]); // D


  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    })
  }

  return (
    <div className={AppStyles.container}>
      <h1 className={AppStyles.headlinePrimary}>Hacker Stories</h1>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr className={AppStyles.divider} />
      <div className={AppStyles.item}>
        <span style={{ width: '32%' }}>
          <strong>Title</strong>
        </span>
        <span style={{ width: '16%' }} className={AppStyles.hideOnMobile}><strong>Author</strong></span>
        <span style={{ width: '16%' }} className={AppStyles.hideOnMobile}><strong>Comments</strong> </span>
        <span style={{ width: '16%', marginRight: '20%' }} className={AppStyles.hideOnMobile}><strong>Points</strong> </span>

      </div>
      {stories.isError && <p>Something went wrong ...</p>}
      {/* adding coditional rendering */}
      {stories.isLoading ?
        (<p>Loading...</p>) :
        (
          <List
            list={stories.data}
            onRemoveItem={handleRemoveStory}
          />
        )
      }
    </div>
  );
}
const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit} className={AppStyles.searchForm}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search</strong>
    </InputWithLabel>
    <button type="submit" disabled={!searchTerm}
      className={`${AppStyles.button} ${AppStyles.buttonLarge} ${AppStyles.buttonSubmit}`}>
      Submit
  </button>
  </form>
);

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
    <div className={AppStyles.item}>
      <span style={{ width: '32%' }}>
        <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
      </span>
      <span style={{ width: '16%' }} >{item.author}</span>
      <span style={{ width: '16%' }} className={AppStyles.hideOnMobile}>{item.num_comments} </span>
      <span style={{ width: '16%' }} className={AppStyles.hideOnMobile}>{item.points} </span>

      {/* executing item remove in the classical way
      <button type="button" onClick={handleRemoveItem}> */}

      {/* using inline handler by the help of arrow functions */}
      {/* avoid complex logic here!, one function to execute is enough */}
      <span style={{ width: '20%', display: "flex", justifyContent: "flex-end" }}>
        <button type="button" onClick={() => handleRemoveItem(item)}
          className={`${AppStyles.button} ${AppStyles.buttonSmall}`}>
          Dismiss
        </button>
      </span >
    </div >
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
      <label htmlFor={id} className={AppStyles.label}>{children} </label>
      <input
        ref={inputRef}
        value={value}
        id={id}
        type={type}
        onChange={onInputChange}
        autoFocus={isFocused}
        className={AppStyles.input}
      //add auto focus declaretively
      //autoFocus
      />
    </>
  );
}

export default App;
