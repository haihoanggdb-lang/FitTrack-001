// js/utils.js

// 1. Định nghĩa hàm có tham số và giá trị trả về
// Tính toán calo tiêu thụ: calo/phút * số phút
function calculateCalories(caloriesPerMinute, durationMinutes) {
    // Ép kiểu dữ liệu để đảm bảo tính toán đúng
    const cpm = parseFloat(caloriesPerMinute);
    const duration = parseFloat(durationMinutes);
    
    if (isNaN(cpm) || isNaN(duration) || duration <= 0) {
        return 0;
    }
    
    return cpm * duration;
}

// 2. Hàm định dạng ngày tháng (YYYY-MM-DD)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}