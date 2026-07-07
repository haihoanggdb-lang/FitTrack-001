// js/main.js

$(document).ready(function() {
    let globalExercises = []; // Lưu danh sách bài tập để dùng lại

    // --- Khởi tạo trang ---
    loadInitialData();

    async function loadInitialData() {
        
        // 1. Load bài tập cho Dropdown
        globalExercises = await getAllExercises();
        renderExerciseSelect(globalExercises);

        // 2. Load lịch sử buổi tập
        const workouts = await getAllWorkouts();
        renderWorkoutList(workouts);
    }

    // --- Render dữ liệu lên giao diện ---
    function renderExerciseSelect(exercises) {
        const $select = $('#exercise-select');
        // Xóa các option cũ trừ option đầu tiên
        $select.find('option:not(:first)').remove();

        exercises.forEach(ex => {
            $select.append(`<option value="${ex.id}" data-cpm="${ex.caloriesPerMinute}">${ex.name}</option>`);
        });
    }

    function renderWorkoutList(workouts) {
        const $tbody = $('#workout-list');
        $tbody.empty(); // Xóa dữ liệu cũ

        // Sắp xếp theo ngày mới nhất
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        workouts.forEach(w => {
            const row = `
                <tr>
                    <td>${formatDate(w.date)}</td>
                    <td>${w.exerciseName}</td>
                    <td>${w.duration}</td>
                    <td>${w.caloriesBurned.toFixed(0)}</td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    // --- Xử lý sự kiện (Form Submit) ---
    $('#workout-form').on('submit', async function(e) {
        e.preventDefault(); // Ngăn load lại trang

        // 1. Thu thập dữ liệu từ form
        const exerciseId = $('#exercise-select').val();
        const duration = $('#duration-input').val();
        const date = $('#date-input').val();
        const selectedOption = $('#exercise-select option:selected');
        const exerciseName = selectedOption.text();
        const caloriesPerMinute = selectedOption.data('cpm');

        // 2. Form Validation cơ bản
        if (!exerciseId) {
            alert('Vui lòng chọn một bài tập.');
            return;
        }

        // 3. Tính toán Calo
        const caloriesBurned = calculateCalories(caloriesPerMinute, duration);

        // 4. Chuẩn bị dữ liệu gửi đi
        const newWorkout = {
            date: date,
            exerciseId: exerciseId,
            exerciseName: exerciseName,
            duration: parseInt(duration),
            caloriesBurned: caloriesBurned
        };

        // 5. Thêm thông báo "Loading"
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalBtnText = $submitBtn.text();
        $submitBtn.text('Đang ghi...').prop('disabled', true);

        // 6. Gọi API thêm dữ liệu
        const createdWorkout = await createWorkout(newWorkout);

        // 7. Xử lý sau khi thêm thành công
        if (createdWorkout) {
            alert('Đã ghi lại buổi tập thành công!');
            // Reset form
            $('#workout-form')[0].reset();
            // Load lại danh sách
            const updatedWorkouts = await getAllWorkouts();
            renderWorkoutList(updatedWorkouts);
        }

        // Hoàn tất Loading
        $submitBtn.text(originalBtnText).prop('disabled', false);
    });
});