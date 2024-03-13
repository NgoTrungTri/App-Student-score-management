import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { endpoints } from '../../configs/Apis';


const TeacherLesson = ({ route, navigation }) => {
    const { id } = route.params;
    const [lessons, setLessons] = useState(null);

    
    useEffect(() => {
        // Hàm fetchLessons để lấy danh sách môn học từ API
        const fetchLessons = async () => {
            try {
                const response = await fetch(endpoints['GV_lessons'](id)); 
                const data = await response.json();
                setLessons(data); // Cập nhật state lessons với dữ liệu môn học từ API
            } catch (error) {
                console.error('Lỗi lấy danh sách môn học:', error);
            }
        };         
        fetchLessons(); // Gọi hàm fetchLessons khi component được render
    }, [id]); // useEffect sẽ chạy lại khi giá trị id thay đổi

    const goToTeacherLessonDetail = (lessonId) => {
        navigation.navigate("TeacherLessonDetail", {"id": lessonId} )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.subject}>Danh Sách Môn Giảng Dạy</Text>
            <ScrollView style={styles.scrollView}>
                {lessons === null ? (
                    <ActivityIndicator />
                ) : (
                    lessons.map(lesson => (
                        <View key={lesson.id} style={styles.block} >
                            <TouchableOpacity onPress={() => goToTeacherLessonDetail(lesson.id)}>
                                <Text style={styles.text}>{lesson.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => goToTeacherLessonDetail(lesson.id)}>
                                <Image source={{ uri: `https://res.cloudinary.com/dhrkxbsmh/${lesson.avatar}` }} style={styles.image} />
                            </TouchableOpacity>                         
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    subject: {
        color: "blue",
        textAlign: "center",
        fontSize: 38,
        fontWeight: "bold",
        paddingTop: 15,
        marginBottom: 15
    },
    block: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 10, 
    },
    text: {
        fontSize: 26, 
        fontWeight: 'bold', 
    },
    image: {
        width: 150, 
        height: 150, 
    },
});

export default TeacherLesson;