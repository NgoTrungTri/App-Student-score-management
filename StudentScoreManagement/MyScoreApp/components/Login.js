import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useState, useEffect, useReducer } from 'react';
import { encode as base64encode } from 'base-64'; // Import hàm encode từ thư viện base-64
import {  Keyboard, StyleSheet,Text,View,TextInput,TouchableOpacity,ScrollView,ActivityIndicator,Alert} from 'react-native';
import MyContext from '../configs/MyContext';


const Login = ({ navigation }) => {
    const [grantType, setGrantType] = useState('password');
    const [clientId, setClientId] = useState('mowJgUGc1C9zbv5aUzQxjltLNg5qi2tnLAvB6aHc');
    const [clientSecret, setClientSecret] = useState('OO7v5OlQEFkUqtbO3JzFwgJUKk7zJvR0OF2vVPxLi32QZOOEnq3BGkuzhqV7t3pw3nxA4p0FZIBRerDaEYUUFkIRPhIFpuA9TJUXFo3mhoHvSEC1xJcCpSCLMv3uTqB6');
    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [loading, setLoading] = useState(false);
    const [user, dispatch] = useContext(MyContext);
    const [userType, setUserType] = useState('');

    ///Thiết lập Link cho server
    const HOST = "http://192.168.1.8:8000"
    
    const UserType = (type) => {
        setUserType(type); // Thiết lập loại người dùng mới
    };

    const handleGetToken = () => {
        getToken(grantType, clientId, clientSecret, username, password);
    };

    const getToken = async (grantType, clientId, clientSecret, username, password) => {
        setLoading(true);
        
        try {            
                const bodyParams = grantType === 'password' ? `grant_type=password&username=${username}&password=${password}` : 'grant_type=client_credentials';
                const authHeader = `Basic ${base64encode(`${clientId}:${clientSecret}`)}`; // Mã hóa clientId và clientSecret thành chuỗi base64
                const response = await fetch(`${HOST}/o/token/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': authHeader
                    },
                    body: bodyParams,
                });
                
                ///Chuyển dữ liệu Data dưới dạng Json
                const data = await response.json();

                await AsyncStorage.setItem("access-token", data.access_token)
                
                const user = await fetch(`${HOST}/users/current_user/`, {
                    headers: {
                        "Authorization": `Bearer ${data.access_token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Không thể lấy dữ liệu người dùng.');
                }
                console.log(user.json)
                // Chuyển đổi dữ liệu phản hồi sang dạng JSON                            
                const userData = await user.json(); 
                console.log(userData)

                if (userType === 'Giảng viên') {
                    if (userData.is_giangvien === true) {
                        dispatch({
                            type: "login",
                            payload: userData
                        });
                        navigation.navigate("TeacherInfo")
                    }
                    else{
                        Alert.alert("Tài khoản hoặc mật khẩu không đúng")
                    }
                }

                if (userType === 'Sinh viên' ) {
                    if(userData.is_sinhvien === true) {
                        dispatch({
                            type: "login",
                            payload: userData
                        });
                        navigation.navigate("StudentInfo")
                    }
                    else {
                        Alert.alert("Tài khoản hoặc mật khẩu không đúng")
                    }                    
                }                          
                ///Kiểm tra
                // console.log('Token:', data.access_token);
                // console.log(userData.is_giangvien);
                // console.log(userData.is_sinhvien);
            }
            catch (error) {
            console.error('Lỗi đăng nhập:', error);
            } finally {
            setLoading(false);
            }
    };  

return (
    <View style={styles.container} >
        <Text style={styles.title}>ĐĂNG NHẬP</Text>
        <View style={styles.userTypeContainer}>
            <TouchableOpacity onPress={() => UserType('Giảng viên')}>
                <Text style={userType === 'Giảng viên' ? styles.selectedUserType : styles.userType}>Giảng viên</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => UserType('Sinh viên')}>
                <Text style={userType === 'Sinh viên' ? styles.selectedUserType : styles.userType}>Sinh viên</Text>
            </TouchableOpacity>
        </View>
        <TextInput
            style={styles.input}
            value={username}
            onChangeText={text => setUsername(text)}
            placeholder="Tên đăng nhập..."
        />
        <TextInput
            style={styles.input}
            value={password}
            onChangeText={text => setPassword(text)}
            placeholder="Mật khẩu..."
            secureTextEntry={true}
        />
            {loading===true?<ActivityIndicator/>:<>
            <TouchableOpacity style={styles.button} onPress={handleGetToken}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>
        </>}
    </View>
    )
}; 

export default Login;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingBottom: 300, ///Đẩy lên cho điện thoại bấm do bàn phím không ẩn được
    },
    title: {
      fontSize: 38,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    userTypeContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    userType: {
      fontSize: 16,
      marginRight: 20,
      color: 'black',
    },
    selectedUserType: {
      fontSize: 16,
      marginRight: 20,
      color: 'blue',
      fontWeight: 'bold',
    },
    input: {
      width: '80%',
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
    },
    button: {
      width: '80%',
      backgroundColor: 'blue',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });