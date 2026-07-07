// js/api.js

const BASE_URL = 'https://6a4cb178e1cf82a4a17d6c8f.mockapi.io/api/v1';

// 1. Lấy danh sách bài tập (cho Dropdown)
async function getAllExercises() {
    try {
        const response = await fetch(`${BASE_URL}/exercises`);
        if (!response.ok) throw new Error('Không thể lấy danh sách bài tập.');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Lỗi: ' + error.message);
        return [];
    }
}

// 2. Lấy danh sách buổi tập
async function getAllWorkouts() {
    try {
        const response = await fetch(`${BASE_URL}/workouts`);
        if (!response.ok) throw new Error('Không thể lấy lịch sử tập luyện.');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Lỗi: ' + error.message);
        return [];
    }
}

// 3. Thêm một buổi tập mới
async function createWorkout(workoutData) {
    try {
        const response = await fetch(`${BASE_URL}/workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workoutData)
        });
        if (!response.ok) throw new Error('Không thể thêm buổi tập.');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Lỗi: ' + error.message);
    }
}