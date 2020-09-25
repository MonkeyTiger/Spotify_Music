import React, { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import { newSearch } from '../actions/SearchActions';
import { search } from '../actions/PlaylistActions';
import { PLAYLIST_DEFAULT_SIZE } from '../constants/constants';
import ReactGA from 'react-ga';

const SearchBox = ({ value, list, country }) => {
  const [searchVal, setSearchVal] = useState(value ? value.value : '');
  const [suggestions, setSuggestions] = useState(list || []);

  useEffect(() => {
    setSuggestions(list || []);
  }, [list]);
  const _search = (text) => {
    newSearch(text);
    search(text, country, PLAYLIST_DEFAULT_SIZE);
    ReactGA.ga('send', 'event', 'event', 'new-search', text);
  }
  const _handleSearch = () => {
    const text = document.querySelector('#search-input').value;
    if (text.length > 3) {
      _search(text);
      ReactGA.ga('send', 'event', 'button', 'click', 'search-box-input');
    }
  }

  const onChange = (event, { newValue }) => {
    setSearchVal(newValue);
  }

  const suggestionRenderer = (track) => {
    return <span>{track.name}, {track.artists.first().name}</span>;
  };

  const getSuggestionValue = (track) => {
    _search({ value: track.name });
    return track.name;
  };

  const showWhen = (input) => {
    return input.trim().length > 3;
  };

  const onSuggestionsFetchRequested = (suggestion) => {
    _search({ value: suggestion.value });
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  }

  const inputProps = {
    id: 'search-input',
    value: searchVal,
    type: 'text',
    ref: 'searchInput',
    className: 'input-search',
    placeholder: 'What is your favorite song?',
    onChange: onChange,
  };
  return <div className='search-box'>
    <div className='search-group'>
      <span className='input-group-btn'>
        <div className='btn-search' onClick={_handleSearch}>
          <img src='img/search.svg' alt="" />
        </div>
      </span>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={suggestionRenderer}
        shouldRenderSuggestions={showWhen}
        inputProps={inputProps}
      />
    </div>
  </div>;

}

export default SearchBox;
