import React from 'react';
import logo from './logo.svg';
import './App.css';
import VerticalStackFullPageContainer from './components/ui/element/container/VerticalStackFullPageCotainer';
import QuestionIndex from './components/ui/composite/QuestionIndex';
import QuestionBody from './components/ui/composite/QuestionBody';
import RadioOptions from './components/ui/element/options/RadioOptions';
import Button from './components/ui/element/button/Button';
import ApiService from './services/ApiService';
import ActiveExam from './components/functional/exam/ActiveExam';

function App() {
  return (
    <VerticalStackFullPageContainer>
      
      <ActiveExam/>
     
    </VerticalStackFullPageContainer>
  );
}

export default App;
