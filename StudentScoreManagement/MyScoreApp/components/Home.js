import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from '../components/Login';
import Logout from '../components/Logout';
import Register from '../components/Register';
import StudentInfo from '../components/Student/StudentInfo';
import StudentLesson from '../components/Student/StudentLesson';
import StudentLessonScore from '../components/Student/StudentLessonScore';
import TeacherLesson from '../components/Teacher/TeacherLesson';
import TeacherInfo from '../components/Teacher/TeacherInfo';
import Forum from '../components/Forum';
import TeacherLessonDetail from '../components/Teacher/TeacherLessonDetail';
import { useReducer } from 'react';
import MyUserReducer from '../reducers/MyUserReducer';
import MyContext from '../configs/MyContext';


const Drawer = createDrawerNavigator();


const Home = () => {
    const [user, dispatch] = useReducer(MyUserReducer, null);
    
    return (
      <MyContext.Provider value={[user, dispatch]}>
        <NavigationContainer>
          <Drawer.Navigator screenOptions={{headerRight: Logout}} >
            {user===null?<>
              <Drawer.Screen name="Login" component={Login} options={{title: 'Đăng Nhập'}}/> 
              <Drawer.Screen name="Register" component={Register} options={{title: 'Đăng Kí'}}/>           
            </>:<>
               <Drawer.Screen name="StudentInfo" component={StudentInfo} options={{title: 'Thông Tin SV'}}/> 
              <Drawer.Screen name="StudentLesson" component={StudentLesson} options={{title: 'Môn Học'}} />
              <Drawer.Screen name="StudentLessonScore" component={StudentLessonScore} options={{title: "Bài học", drawerItemStyle: {display: "none"}}} />
              <Drawer.Screen name="TeacherInfo" component={TeacherInfo} options={{title: "Thông Tin GV"}} />
              <Drawer.Screen name="TeacherLesson" component={TeacherLesson} options={{title: "Các Môn dạy"}} /> 
              <Drawer.Screen name="TeacherLessonDetail" component={TeacherLessonDetail} options={{title: "Chi tiết bài học"}} />                         
              <Drawer.Screen name="Forum" component={Forum} options={{title: "Diễn đàn"}} />
            </>}
            
          </Drawer.Navigator>
        </NavigationContainer>
      </MyContext.Provider>  
  );
}
export default Home;