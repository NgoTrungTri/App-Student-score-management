import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useContext } from 'react';
import MyContext from '../../configs/MyContext';
import { endpoints } from '../../configs/Apis';

const StudentLessonScore = ({route}) => {

    const [user] = useContext(MyContext);

    if (!user) {
        return <ActivityIndicator/>;
    }

    const { lessonId } = route.params;
    const [lessonGrades, setLessonGrades] = useState([]);
    ///Thiết lập địa chỉ của server
    const HOST = 'http://192.168.1.8:8000/lessongrades'

    const getLessonGradeId = async (lessonId) => {
        try {            
            const response = await fetch(endpoints['lesson_grade_id'](lessonId));
            const data = await response.json();            
            return data.lesson_grade_id;
        } catch (error) {
            console.error('Lỗi lấy id của LessonGrade:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchLessonGrades = async () => {
            try {
                const lessonGradeId = await getLessonGradeId(lessonId);
                if (lessonGradeId) {
                    const response = await fetch(`${HOST}/${lessonGradeId}/search_student/?student_id=${user.ma_sinhvien}`);
                    const data = await response.json();
                    setLessonGrades(data);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách điểm:', error);
            }
        };

        fetchLessonGrades();
    }, [lessonId]);
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Điểm của sinh viên</Text>
            <View style={styles.gradeList}>
                {lessonGrades.map((grade, index) => (
                    <View key={index} style={styles.gradeItem}>
                        <Text style={styles.score}>Sinh Viên:  {grade.students.first_name} {grade.students.last_name}</Text>
                        <Text style={styles.score}>Điểm Giữa Kỳ:  {grade.midterm_score}</Text>
                        <Text style={styles.score}>Điểm Cuối Kỳ:  {grade.final_score}</Text>
                        <Text style={styles.score}>Cột điểm thêm 1:  {grade.new_score_1}</Text>
                        <Text style={styles.score}>Cột điểm thêm 2:  {grade.new_score_2}</Text>
                        <Text style={styles.score}>Cột điểm thêm 3:  {grade.new_score_3}</Text>
                        <Text style={styles.score}>Cột điểm thêm 4:  {grade.new_score_4}</Text>
                        <Text style={styles.score}>Cột điểm thêm 5:  {grade.new_score_5}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'whitesmoke',
    },
    header: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: "blue"
    },
    gradeList: {
        flex: 1,
    },
    gradeItem: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    }
});

export default StudentLessonScore;