import './App.css';
import VerticalStackFullPageContainer from './components/ui/element/container/VerticalStackFullPageCotainer';
import ActiveExam from './components/functional/exam/ActiveExam';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommonLayout from './components/layouts/commonLayout/CommonLayout';
import CandidateHome from './components/home/candidateHome/CandidateHome';

function App() {
  return (
    <VerticalStackFullPageContainer>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<CommonLayout/>}>
            <Route index element={<CandidateHome/>}/>
            <Route path = "exam/:examId" element={<ActiveExam/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
     
    </VerticalStackFullPageContainer>
  );
}

export default App;
