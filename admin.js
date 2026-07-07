// js/admin.js

$(document).ready(function() {
    // Biến toàn cục lưu trữ trạng thái chỉnh sửa
    let editExerciseId = null;

    // --- 1. KHỞI TẠO TRANG ---
    loadAdminData();

    async function loadAdminData() {
        showTableLoading();
        // Lấy danh sách bài tập từ MockAPI
        const exercises = await getAllExercises(); 
        renderAdminExerciseTable(exercises);
    }

    // --- 2. HIỂN THỊ TRẠNG THÁI LOADING & SKELETON ---
    function showTableLoading() {
        const $tbody = $('#admin-exercise-table');
        $tbody.empty();
        
        // Tạo 3 dòng skeleton để giả lập trạng thái đang chờ API gánh dữ liệu
        for (let i = 0; i < 3; i++) {
            $tbody.append(`
                <tr class="skeleton-row">
                    <td><div class="skeleton-box"></div></td>
                    <td><div class="skeleton-box"></div></td>
                    <td><div class="skeleton-box"></div></td>
                    <td><div class="skeleton-box"></div></td>
                    <td><div class="skeleton-box"></div></td>
                    <td><div class="skeleton-box"></div></td>
                </tr>
            `);
        }
    }

    // --- 3. ĐỔ DỮ LIỆU LÊN BẢNG QUẢN TRỊ ---
    function renderAdminExerciseTable(exercises) {
        const $tbody = $('#admin-exercise-table');
        $tbody.empty();

        if (exercises.length === 0) {
            $tbody.append('<tr><td colspan="6" class="text-center text-muted">Chưa có bài tập nào. Hãy thêm bài tập mới!</td></tr>');
            return;
        }

        exercises.forEach(ex => {
            const row = `
                <tr id="ex-row-${ex.id}">
                    <td data-label="ID">${ex.id}</td>
                    <td data-label="Tên bài tập" class="fw-bold">${ex.name}</td>
                    <td data-label="Phân loại">${ex.category}</td>
                    <td data-label="Nhóm cơ mục tiêu"><span class="badge bg-info text-dark">${ex.muscleGroup}</span></td>
                    <td data-label="Calo/Phút">${ex.caloriesPerMinute} kcal</td>
                    <td data-label="Hành động">
                        <button class="btn btn-sm btn-warning btn-edit me-1" data-id="${ex.id}">Sửa</button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${ex.id}">Xóa</button>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    // --- 4. FORM VALIDATION NÂNG CAO & SUBMIT ---
    $('#exercise-form').on('submit', async function(e) {
        e.preventDefault();
        
        // Xóa sạch các thông báo lỗi inline cũ trước khi validate lại
        $('.inline-error').remove();
        $('.is-invalid').removeClass('is-invalid');

        // Thu thập dữ liệu từ các ô nhập
        const name = $('#ex-name').val().trim();
        const category = $('#ex-category').val();
        const muscleGroup = $('#ex-muscle').val().trim();
        const cpm = $('#ex-cpm').val().trim();
        const description = $('#ex-desc').val().trim();

        let isValid = true;

        // Tiến hành kiểm tra dữ liệu đầu vào (Validation)
        if (name === '') {
            showError('#ex-name', 'Tên bài tập không được để trống.');
            isValid = false;
        }
        if (!category) {
            showError('#ex-category', 'Vui lòng chọn một danh mục bài tập.');
            isValid = false;
        }
        if (muscleGroup === '') {
            showError('#ex-muscle', 'Vui lòng điền nhóm cơ tác động chính.');
            isValid = false;
        }
        if (cpm === '' || parseFloat(cpm) <= 0) {
            showError('#ex-cpm', 'Lượng Calo/Phút phải lớn hơn 0.');
            isValid = false;
        }

        // Ngăn submit form nếu dữ liệu không hợp lệ
        if (!isValid) return;

        // Đóng gói payload dữ liệu theo Schema cấu hình
        const exerciseData = {
            name: name,
            category: category,
            muscleGroup: muscleGroup,
            caloriesPerMinute: parseFloat(cpm),
            description: description,
            image: "https://loremflickr.com/320/240/fitness" // Ảnh giả lập tự sinh hợp lệ
        };

        const $submitBtn = $(this).find('button[type="submit"]');
        $submitBtn.prop('disabled', true).text('Đang xử lý...');

        try {
            if (editExerciseId === null) {
                // Chế độ: THÊM MỚI (Thao tác POST)
                const response = await fetch('https://6a4cb178e1cf82a4a17d6c8f.mockapi.io/api/v1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(exerciseData)
                });
                if (response.ok) alert('Thêm bài tập thành công!');
            } else {
                // Chế độ: CẬP NHẬT/SỬA (Thao tác PUT)
                const response = await fetch(`https://6a4cb178e1cf82a4a17d6c8f.mockapi.io/api/v1/${editExerciseId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(exerciseData)
                });
                if (response.ok) alert('Cập nhật bài tập thành công!');
                resetFormState(); // Trở về trạng thái form thêm mới ban đầu
            }

            // Reset form sạch sẽ và load lại bảng dữ liệu mới
            $('#exercise-form')[0].reset();
            loadAdminData();

        } catch (error) {
            alert('Có lỗi xảy ra trong quá trình xử lý: ' + error.message);
        } finally {
            $submitBtn.prop('disabled', false).text(editExerciseId ? 'Cập nhật Bài tập' : 'Thêm Bài tập');
        }
    });

    // Hàm phụ hiển thị lỗi Inline ngay dưới từng trường nhập
    function showError(selector, message) {
        $(selector).addClass('is-invalid');
        $(selector).after(`<span class="inline-error">${message}</span>`);
    }

    // --- 5. ĐỔ DỮ LIỆU LÊN FORM ĐỂ SỬA (Thao tác GET từng dòng) ---
    // Sử dụng kỹ thuật Event Delegation của jQuery cho các nút tạo động
    $('#admin-exercise-table').on('click', '.btn-edit', async function() {
        const id = $(this).data('id');
        
        try {
            const response = await fetch(`https://6a4cb178e1cf82a4a17d6c8f.mockapi.io/api/v1/${id}`);
            if (!response.ok) throw new Error('Không thể lấy chi tiết bài tập này.');
            
            const ex = await response.json();

            // Điền dữ liệu lấy từ API ngược trở lại Form nhập
            editExerciseId = ex.id;
            $('#ex-name').val(ex.name);
            $('#ex-category').val(ex.category);
            $('#ex-muscle').val(ex.muscleGroup);
            $('#ex-cpm').val(ex.caloriesPerMinute);
            $('#ex-desc').val(ex.description);

            // Đổi giao diện form sang chế độ Edit bằng hiệu ứng jQuery
            $('#form-title').text('Cập nhật bài tập: ID #' + editExerciseId);
            $('#btn-cancel-edit').removeClass('d-none'); // Hiện nút hủy sửa
            
            // Cuộn mượt màn hình lên đầu form để tiện chỉnh sửa
            $('html, body').animate({ scrollTop: $('#exercise-form').offset().top - 100 }, 400);

        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    });

    // Nút hủy bỏ trạng thái chỉnh sửa
    $('#btn-cancel-edit').on('click', function() {
        resetFormState();
        $('#exercise-form')[0].reset();
    });

    function resetFormState() {
        editExerciseId = null;
        $('#form-title').text('Thêm Bài tập mới');
        $('#btn-cancel-edit').addClass('d-none');
        $('.inline-error').remove();
        $('.is-invalid').removeClass('is-invalid');
    }

    // --- 6. XỬ LÝ XÓA BÀI TẬP ---
    $('#admin-exercise-table').on('click', '.btn-delete', async function() {
        const id = $(this).data('id');
        
        if (confirm(`Bạn có chắc chắn muốn xóa bài tập ID #${id} này không? Hãy cân nhắc kỹ!`)) {
            try {
                const response = await fetch(`https://6a4cb178e1cf82a4a17d6c8f.mockapi.io/api/v1/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Áp dụng hiệu ứng jQuery fadeOut tịnh tiến hàng bị xóa đi
                    $(`#ex-row-${id}`).fadeOut(600, function() {
                        $(this).remove();
                        // Nếu bảng trống rỗng sau khi xóa, reload lại để hiện dòng cảnh báo trống
                        if ($('#admin-exercise-table tr').length === 0) {
                            loadAdminData();
                        }
                    });
                } else {
                    throw new Error('Lỗi phản hồi từ máy chủ khi cố xóa.');
                }
            } catch (error) {
                alert('Xóa thất bại: ' + error.message);
            }
        }
    });
});