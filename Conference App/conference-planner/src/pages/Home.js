import React, { useState, useEffect } from 'react';
import { getAllTalks } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

const Home = () => {
  const [talks, setTalks] = useState([]);
  const [filteredTalks, setFilteredTalks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [expandedTalkId, setExpandedTalkId] = useState(null);
  const [interestedTalks, setInterestedTalks] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  
  const uniqueTags = [
    ...new Set(talks.flatMap((talk) => talk.tags || [])),
  ];

  useEffect(() => {
    const fetchTalks = async () => {
      const data = await getAllTalks();
      setTalks(data);
      setFilteredTalks(data);
    };
    fetchTalks();
  }, []);

  useEffect(() => {
    const savedSchedule = JSON.parse(localStorage.getItem('schedule')) || [];
    setSchedule(savedSchedule);
  }, []);

  useEffect(() => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    const savedInterestedTalks =
      JSON.parse(localStorage.getItem('interestedTalks')) || [];
    setInterestedTalks(savedInterestedTalks);
  }, []);

  useEffect(() => {
    localStorage.setItem('interestedTalks', JSON.stringify(interestedTalks));
  }, [interestedTalks]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    filterTalks(term, selectedSession, selectedTags);
  };

  const handleSessionFilter = (event) => {
    const session = event.target.value;
    setSelectedSession(session);
    filterTalks(searchTerm, session, selectedTags);
  };

  const handleTagFilter = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag) 
      : [...selectedTags, tag]; 
    setSelectedTags(updatedTags);
    filterTalks(searchTerm, selectedSession, updatedTags);
  };

  const filterTalks = (term, session, tags) => {
    let filtered = talks;

    if (term) {
      filtered = filtered.filter((talk) =>
        talk.speaker.toLowerCase().includes(term)
      );
    }

    if (session) {
      if (session === 'Interesting') {
        filtered = filtered.filter((talk) =>
          interestedTalks.includes(talk.id)
        );
      } else {
        filtered = filtered.filter((talk) => talk.session === session);
      }
    }

    if (tags.length > 0) {
      filtered = filtered.filter((talk) =>
        tags.every((tag) => talk.tags?.includes(tag))
      );
    }

    setFilteredTalks(filtered);
  };

  const toggleInterest = (talkId) => {
    setInterestedTalks((prevInterestedTalks) =>
      prevInterestedTalks.includes(talkId)
        ? prevInterestedTalks.filter((id) => id !== talkId)
        : [...prevInterestedTalks, talkId]
    );
  };

  const hasTimeConflict = (newTalk) =>
    schedule.some((scheduledTalk) => scheduledTalk.time === newTalk.time);

  const addToSchedule = (talk) => {
    if (schedule.some((scheduledTalk) => scheduledTalk.id === talk.id)) {
      toast.error('This talk is already in your schedule.');
      return;
    }
    if (hasTimeConflict(talk)) {
      toast.warning('This talk conflicts with another talk in your schedule.');
      return;
    }
    setSchedule([...schedule, talk]);
    toast.success(`Added "${talk.title}" to your schedule!`);
  };

  const removeFromSchedule = (talkId) => {
    setSchedule(schedule.filter((talk) => talk.id !== talkId));
    toast.info('Talk removed from your schedule.');
  };

  const clearSchedule = () => {
    setSchedule([]);
    toast.success('Schedule cleared.');
  };

  const toggleDescription = (talkId) =>
    setExpandedTalkId((prev) => (prev === talkId ? null : talkId));

  const rateTalk = (talkId, rating) => {
    setTalks((prevTalks) =>
      prevTalks.map((talk) =>
        talk.id === talkId
          ? { ...talk, ratings: [...talk.ratings, rating] }
          : talk
      )
    );
    toast.success(`Rated talk ${talkId} with ${rating} stars!`);
  };

  const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const sortedSchedule = schedule.sort((a, b) => {
    const timeA = parseInt(a.time.replace(':', ''), 10);
    const timeB = parseInt(b.time.replace(':', ''), 10);
    return timeA - timeB;
  });

  return (
    <div className="home-container">
      <h1 className="title">Conference Talks</h1>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by speaker"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      <div className="session-filter">
        <h3>Browse by Session</h3>
        <select
          value={selectedSession}
          onChange={handleSessionFilter}
          className="dropdown"
        >
          <option value="">All Sessions</option>
          <option value="A">Session A</option>
          <option value="B">Session B</option>
          <option value="C">Session C</option>
          <option value="Interesting">Interesting Talks</option>
        </select>
      </div>
      <div className="tag-filter">
        <h3>Filter by Tags</h3>
        <div className="tags-container">
          {uniqueTags.map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagFilter(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
      </div>
      <h2 className="section-title">All Talks</h2>
      <ul className="talks-list">
        {filteredTalks.map((talk) => (
          <li
            key={talk.id}
            className={`talk-item ${
              interestedTalks.includes(talk.id) ? 'interested' : ''
            }`}
          >
            <div className="talk-details">
              <strong>{talk.title}</strong> - {talk.speaker}
            </div>
            <div>Time: {talk.time}</div>
            <div>Session: {talk.session}</div>
            <div className="rating">
              <strong>Average Rating:</strong>{' '}
              {calculateAverageRating(talk.ratings)} / 5
            </div>
            <div className="rate-talk">
              <label htmlFor={`rate-${talk.id}`}>Rate this talk:</label>
              <select
                id={`rate-${talk.id}`}
                onChange={(e) => rateTalk(talk.id, parseInt(e.target.value))}
                defaultValue=""
                className="rating-dropdown"
              >
                <option value="" disabled>
                  Select rating
                </option>
                {[1, 2, 3, 4, 5].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}
                  </option>
                ))}
              </select>
            </div>
            <div className="button-group">
              <button
                onClick={() => toggleInterest(talk.id)}
                className="interest-button"
              >
                {interestedTalks.includes(talk.id)
                  ? 'Unmark Interest'
                  : 'Mark as Interesting'}
              </button>
              <button
                onClick={() => toggleDescription(talk.id)}
                className="description-toggle"
              >
                {expandedTalkId === talk.id
                  ? 'Hide Description'
                  : 'View Description'}
              </button>
              <button
                onClick={() => addToSchedule(talk)}
                className="schedule-button"
              >
                Add to Schedule
              </button>
            </div>
            {expandedTalkId === talk.id && (
              <div className="description">{talk.description}</div>
            )}
          </li>
        ))}
      </ul>
      <h2 className="section-title">My Schedule</h2>
      <ul className="schedule-list">
        {sortedSchedule.map((talk) => (
          <li key={talk.id} className="schedule-item">
            <div>
              <strong>{talk.title}</strong> - {talk.speaker}
            </div>
            <div>Time: {talk.time}</div>
            <div>Session: {talk.session}</div>
            <button
              onClick={() => removeFromSchedule(talk.id)}
              className="remove-button"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button onClick={clearSchedule} className="clear-schedule">
        Clear Schedule
      </button>
    </div>
  );
};

export default Home;
