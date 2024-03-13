import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MyContext from '../../configs/MyContext';

const TeacherInfo = ({navigation}) => {
    // Sử dụng useContext để lấy dữ liệu người dùng từ global state
    const [user] = useContext(MyContext);

    // Kiểm tra nếu user không tồn tại hoặc không có dữ liệu
    if (!user) {
        return <ActivityIndicator/>;
    }
    
    const goToTeacherLesson = (id) => {
        navigation.navigate("TeacherLesson", {"id": id} )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>THÔNG TIN SINH VIÊN</Text>
            </View>
            <View style={styles.userInfo}>
                <Image source={{ uri: `https://res.cloudinary.com/dhrkxbsmh/${user.avatar}` }} style={styles.avatar} />
                <Text style={styles.infoItem}><Text style={styles.label}>Họ Tên:</Text> {user.first_name} {user.last_name}</Text>
                <Text style={styles.infoItem}><Text style={styles.label}>Email:</Text> {user.email}</Text>
                <Text style={styles.infoItem}><Text style={styles.label}>Tên Đăng Nhập:</Text> {user.username}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => goToTeacherLesson(user.id)}>
                <Text style={styles.buttonText}>Xem Môn Giảng Dạy</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0077C8',
        padding: 20,
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userInfo: {
        backgroundColor: '#F7F7F7',
        padding: 20,
        borderRadius: 10,
        alignItems: 'flex-start', 
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        borderWidth: 1, 
        borderColor: '#000', 
    },
    infoItem: {
        fontSize: 20,
        marginBottom: 10,
        color: '#333333',
    },
    label: {
        fontWeight: 'bold',
        marginRight: 5, // Khoảng cách giữa nhãn và nội dung
    },
    button: {
        marginTop: 20,
        width: '100%',
        backgroundColor: '#CCF381',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        color: '#fff',
        fontSize: 35
    },
});

export default TeacherInfo;