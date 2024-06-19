import './App.css';
import VerticalStackFullPageContainer from './components/ui/element/container/VerticalStackFullPageCotainer';
import ActiveExam from './components/functional/exam/ActiveExam';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommonLayout from './components/layouts/commonLayout/CommonLayout';
import CandidateHome from './components/home/candidateHome/CandidateHome';
import LoginHome from './components/home/login/LoginHome';
import EvaluateExam from './components/functional/exam/EvaluateExam';
import AdminHome from './components/home/adminHome/AdminHome';
import Subjects from './components/functional/admin/subjectAndTopics/Subjects';
import AdminLayout from './components/layouts/adminLayout/AdminLayout';

function App() {
  return (
    <VerticalStackFullPageContainer>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<CommonLayout/>}>
            <Route index element={<LoginHome/>}/>
            <Route path='/admin' element={<AdminLayout/>}>
              <Route index element={<AdminHome/>}/>
              <Route path="subjects" element={<Subjects/>}/>
            </Route>
            <Route path='/home' element={<CandidateHome/>}/>
            <Route path = "exam/evaluate" element={<EvaluateExam/>}/>
            <Route path = "exam/:examId" element={<ActiveExam/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
     
    </VerticalStackFullPageContainer>
  );
}

export default App;
