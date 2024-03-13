import axios from "axios"
HOST = "http://192.168.1.8:8000/"

export const endpoints = {
    "lessons" : `${HOST}/lessons/`,
    'login': `${HOST}/o/token/`,
    'current-user': `${HOST}/users/current-user/`,
    'SV_lessons': (ma_sinhvien) => `${HOST}/lessons/${ma_sinhvien}/student_lessons/`,
    'GV_lessons': (id) => `${HOST}/lessons/${id}/teacher_lessons/`,
    'my_class': (lessonGradeId) => `${HOST}/lessongrades/${lessonGradeId}/my_class/`,
    'lesson_grade_id': (id) => `${HOST}/lessons/${id}/get_lesson_grade_id/`,
}

export default axios.create({
    baseURL: "http://192.168.1.8:8000/"
})