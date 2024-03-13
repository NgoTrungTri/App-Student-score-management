import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity, Alert, TextInput } from 'react-native';
import { endpoints } from '../../configs/Apis';

const TeacherLessonDetail = ({ route, navigation }) => {
    const { id } = route.params;
    const [lessonGrades, setLessonGrades] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [isFormExpanded, setIsFormExpanded] = useState(false); // State to track if the form is expanded or not

    ////Các Thuộc tính để nhập điểm
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [midtermscore, setMidtermScore] = useState('');
    const [finalscore, setFinalScore] = useState('');
    const [newscore1, setNewScore1] = useState('');
    const [newscore2, setNewScore2] = useState('');
    const [newscore3, setNewScore3] = useState('');
    const [newscore4, setNewScore4] = useState('');
    const [newscore5, setNewScore5] = useState('');

    ///Lưu lại thông tin tìm kiếm
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchLessonGrades = async () => {
            try {
                const lessonGradeId = await getLessonGradeId(id);
                if (lessonGradeId) {
                    const response = await fetch(endpoints['my_class'](lessonGradeId));
                    const data = await response.json();
                    setLessonGrades(data);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách điểm:', error);
            }
        };
        fetchLessonGrades();
    }, [id, reloadTrigger]);

    const getLessonGradeId = async (id) => {
        try {
            const response = await fetch(endpoints['lesson_grade_id'](id));
            const data = await response.json();
            return data.lesson_grade_id;
        } catch (error) {
            console.error('Lỗi lấy id của LessonGrade:', error);
            return null;
        }
    };

    const reloadLessonGrades = () => {
        setReloadTrigger(!reloadTrigger);
        setSearchText('')
    };

    const exportpdf = async () => {};

    const exportcsv = () => {};

    const enterScore = async () => {
        try {
            const newScore1Value = newscore1.trim() === '' ? null : newscore1;
            const newScore2Value = newscore2.trim() === '' ? null : newscore2;
            const newScore3Value = newscore3.trim() === '' ? null : newscore3;
            const newScore4Value = newscore4.trim() === '' ? null : newscore4;
            const newScore5Value = newscore5.trim() === '' ? null : newscore5;

            let jsonData = {
                "students": {
                    "first_name": firstname,
                    "last_name": lastname
                },
                "midterm_score": midtermscore,
                "final_score": finalscore,
                "new_score_1": newScore1Value,
                "new_score_2": newScore2Value,
                "new_score_3": newScore3Value,
                "new_score_4": newScore4Value,
                "new_score_5": newScore5Value
            };

            ///Cấu hình link server
            const HOST = 'http://192.168.1.8:8000'

            const response = await fetch(`${HOST}/grades/${id}/enter_score/`, {
                method: 'PUT',
                body: JSON.stringify(jsonData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                Alert.alert("Lưu điểm thành công");
                // Đặt lại giá trị của các trường TextInput thành rỗng
                setFirstName('');
                setLastName('');
                setMidtermScore('');
                setFinalScore('');
                setNewScore1('');
                setNewScore2('');
                setNewScore3('');
                setNewScore4('');
                setNewScore5('');
             } else {
                console.error('Đã xảy ra lỗi khi nhập điểm');
            }
        } catch (error) {
            console.error('Đã xảy ra lỗi khi nhập điểm:', error);
        }
    }

    const toggleForm = () => {
        setIsFormExpanded(!isFormExpanded);
    };

    const searchStudent_id = async () => {
        try {
            const lessonGradeId = await getLessonGradeId(id);
            if (lessonGradeId) {
                const response = await fetch(`${HOST}/lessongrades/${lessonGradeId}/search_student/?student_id=${searchText}`);
                const data = await response.json();
                console.log(data)
                setLessonGrades(data);
            }
        } catch (error) {
            console.error('Lỗi tìm kiếm sinh viên:', error);
        }
    };

    const searchStudent_name = async () => {
        try {
            const lessonGradeId = await getLessonGradeId(id);
            if (lessonGradeId) {
                const response = await fetch(`${HOST}/lessongrades/${lessonGradeId}/search_student/?student_name=${searchText}`);
                const data = await response.json();
                console.log(data)
                setLessonGrades(data);
            }
        } catch (error) {
            console.error('Lỗi tìm kiếm sinh viên:', error);
        }
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button title="Cập Nhật" onPress={reloadLessonGrades} />
                <Button title="Xuất CSV" onPress={exportcsv} />
                <Button title="Xuất PDF" onPress={exportpdf} />
            </View>

            {/* Form nhập điểm */}
            {isFormExpanded && (
                <View style={styles.formContainer}>
                    <Text style={{textAlign: 'center', fontSize: 25, paddingTop: 20, 
                    fontWeight: 'bold', paddingBottom: 20, color: 'blue'}}>Nhập điểm</Text>
                    <TextInput
                        style={styles.input}
                        value={firstname}
                        onChangeText={text => setFirstName(text)}
                        placeholder="Họ của học sinh"
                    />
                    <TextInput
                        style={styles.input}
                        value={lastname}
                        onChangeText={text => setLastName(text)}
                        placeholder="Tên của học sinh"
                    />
                    <TextInput
                        style={styles.input}
                        value={midtermscore}
                        onChangeText={text => setMidtermScore(text)}
                        placeholder="Điểm GK..."
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={finalscore}
                        onChangeText={text => setFinalScore(text)}
                        placeholder="Điểm CK..."
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={newscore1}
                        onChangeText={text => setNewScore1(text)}
                        placeholder="Điểm C1..."
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={newscore2}
                        onChangeText={text => setNewScore2(text)}
                        placeholder="Điểm C2..."
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={newscore3}
                        onChangeText={text => setNewScore3(text)}
                        placeholder="Điểm C3..."
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={newscore4}
                        onChangeText={text => setNewScore4(text)}
                        placeholder="Điểm C4..."
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={newscore5}
                        onChangeText={text => setNewScore5(text)}
                        placeholder="Điểm C5..."
                        keyboardType="numeric"
                    />
                    {/* Nút nhập điểm */}
                    <TouchableOpacity style={styles.button} onPress={enterScore}>
                        <Text style={styles.buttonText}>Nhập Điểm</Text>
                    </TouchableOpacity>
                </View>
            )}
             
            {/* Nút mở rộng form */}
            <TouchableOpacity style={styles.expandButton} onPress={toggleForm}>
                <Text style={styles.expandButtonText}>{isFormExpanded ? 'Ẩn' : 'Nhập điểm'}</Text>
            </TouchableOpacity>

            <View>
                <Text style={styles.header}>Danh Sách Điểm Lớp Học</Text>
            </View>
            
            <View style={styles.table}>
                <ScrollView>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, styles.nameColumn]}>Tên Học Sinh</Text>
                        <Text style={styles.tableHeader}>GK</Text>
                        <Text style={styles.tableHeader}>CK</Text>
                        <Text style={styles.tableHeader}>C1</Text>
                        <Text style={styles.tableHeader}>C2</Text>
                        <Text style={styles.tableHeader}>C3</Text>
                        <Text style={styles.tableHeader}>C4</Text>
                        <Text style={styles.tableHeader}>C5</Text>
                    </View>
                    {lessonGrades.map((grade, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={[styles.tableData, styles.nameColumn]}>{grade.student_first_name} {grade.student_last_name}</Text>
                            <Text style={styles.tableData}>{grade.midterm_score}</Text>
                            <Text style={styles.tableData}>{grade.final_score}</Text>
                            <Text style={styles.tableData}>{grade.new_score_1}</Text>
                            <Text style={styles.tableData}>{grade.new_score_2}</Text>
                            <Text style={styles.tableData}>{grade.new_score_3}</Text>
                            <Text style={styles.tableData}>{grade.new_score_4}</Text>
                            <Text style={styles.tableData}>{grade.new_score_5}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View style={{paddingTop: 20}} >
                    <TextInput
                        style={styles.input}
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Tìm kiếm theo mã sinh viên hoặc tên"
                    />
                    <View style={styles.buttonContainer}>
                        <Button title="Tìm kiếm theo MSSV" onPress={searchStudent_id}/>
                        <Button title="Tìm kiếm theo Tên" onPress={searchStudent_name}/>
                    </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'blue'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    formContainer: {
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    button: {
        width: '100%',
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
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableHeader: {
        flex: 1,
        padding: 15,
        fontWeight: 'bold',
        textAlign: 'left',
        padding: 10,
    },
    nameColumn: {
        flex: 4,
    },
    tableData: {
        flex: 1,
        fontSize: 14,
        lineHeight: 18,
        textAlign: 'left',
        padding: 10,
    },
    expandButton: {
        backgroundColor: 'lightblue',
        marginBottom: 10,
        borderRadius: 5,
        alignItems: 'center',
        padding: 10
    },
    expandButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TeacherLessonDetail;
