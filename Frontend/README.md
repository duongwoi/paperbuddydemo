# PaperBuddy – A-Level Past Paper Practice App

PaperBuddy is a demo web app designed to help students practice A-Level past papers, receive instant AI feedback, and track their progress across subjects.

---

## Features Implemented

### Home Page (`index.html`)
- Clean landing page with navigation bar.
- Hero section with description and app screenshot.
- **Search bar** for jumping into past paper collections.
- "How It Works" section introducing key features:
  - In-app past paper practice
  - AI grading and feedback
  - Essay outline generation
- Subjects available: A-Level Business (9609), A-Level Economics (9708)
- Demo **login/signup modal** (no backend integration)

---

### Dashboard (`dashboard.html`)
- Personalized welcome: displays user’s name.
- **My Subjects Section**:
  - Add/Edit subjects using modal form.
  - Dynamic display of:
    - Subject name
    - Past paper progress (progress bar)
    - Predicted grade (manual/static for now)
    - Link to practice page (`papers.html?subject=...`)
- Responsive layout, dark theme styled with `style.css`.

---

### Past Papers Page (`papers.html`)
- Displays categorized list of A-Level papers by subject and year.
- Filter sidebar to sort papers (basic layout).
- Paper cards with visual status:
  - Completed
  - Not yet attempted
- Each card links to test or attempt page.

---

## Attempt Page (`attempt.html`)
- **Purpose:** Preview a paper before doing it.
- Displays paper content (as images) in scrollable viewer.
- Sidebar shows:
  - Attempt identifier
  - Grade summary
  - Button to retake the paper

---

## Test Page (`test.html`)
- **Purpose:** Full in-app test-taking interface.
- Split layout:
  - Left: Scrollable paper viewer
  - Right: Answer writing area
    - Draft section
    - Main answer section
- Includes:
  - Countdown timer
  - Upload alternative (submit photo instead of typing)
  - Submit button (modal confirmation)
- Designed for distraction-free writing experience.

---

## Result Page (`result.html`)
- **Purpose:** Display AI-graded result and feedback.
- Main blocks:
  - Final predicted grade
  - Score breakdown by section
- Retake and Delete buttons for user control
- Consistent styling with rest of app

---

## Design
- Responsive layout using custom `style.css`
- Dark theme with modern UI components
- Mobile, tablet, and desktop friendly
- Accessible and keyboard-friendly modal/dialog behaviors

---

---

## File Structure
```
PaperBuddy
 ┣ index.html
 ┣ dashboard.html
 ┣ papers.html
 ┣ attempt.html
 ┣ test.html
 ┣ result.html
 ┣ script.js
 ┗ style.css
```
Thư viện ngoài: Google AI Studio

Prompt 1: Yêu cầu chung
Bạn là một expert web designer và developer. Tôi muốn tạo ra một website design (frontend) như trong hình tôi đính kèm, sử dụng HTML, CSS và Javascript.
Trang web là một ứng dụng cho phép làm bài A-Level online và chấm điểm đưa ra feedback, đồng thời lưu lại bài làm trên trang web.
Đối với trang web, tôi có những yêu cầu sau:
Sử dụng các thẻ HTML semantic (ví dụ: <header>, <nav>, <main>, <footer>, <article>, <aside>) để cấu trúc nội dung trang một cách rõ ràng và có ý nghĩa.
Giao diện đáp ứng, phù hợp với nhiều kích thước màn hình khác nhau (desktop, tablet, mobile).
Sử dụng lazy loading để chỉ load ảnh đấy khi ảnh hiện ra trên trang web
Phần HTML, tôi đang chia ra 6 màn hình, tương ứng với 6 file html:
index.html: trang home (landing page) 
dashboard.html: trang dashboard
papers.html: trang list các test paper, có filter
attempt.html: nếu ấn vào paper đã làm, 1 trang hiển thị past attempt, màn hình số 4
test.html: nếu ấn vào past paper chưa làm, trang làm bài, màn hình số 5
result.html: Khi ấn vào submit, trang kết quả
=> Những file html này sử dụng chung file css và 

Trước tiên code cho tôi file HTML, từng trang một. 
Trang home trước, trước khi làm gì hãy hỏi tôi những câu hỏi nếu có 

Prompt 2: Home
Đây là hình ảnh trang home của tôi. Để tôi làm rõ những phần còn trống
1. Phần hình chữ nhật trên cùng của trang là một hình ảnh (vd. một hình ảnh về feedback chấm bài của AI, đại khái như hình 2 tôi đính kèm)
2. Thanh search, có thể để kí hiệu là thanh search và ở button màu xanh nằm trên thanh search để chữ search
3. 3 hình vuông ở phần "How it works", tham khảo hình 3 ở một trang web khác
-> Hình vuông thứ nhất là in-app past paper practice
-> Hình vuông thứ 2 là essay grading and feedback
-> Hình vuông thứ 3 là Paper revision
3. Phần cuối trang là available subject, có hai thanh chữ nhật nhỏ. Hai môn available là A-Level Business (0609) và A-Level Economics (9708)
4. Phần cuối trang là footer
=> Hãy hỏi tôi nếu có gì chưa rõ và nhớ là chỉ code trước HTML thôi

Prompt 3: Sửa lỗi home
Giờ sửa lỗi cho từng file html nhé. Đầu tiên là file index.html cho homescreen
1. vẫn còn lỗi vị trí của component, khoảng cách. chỉnh lại cho sát hơn với ảnh của tôi
-> phần navigation bar đang bị căn giữa, trên thiết kế nó sát ở hia bên hơn
-> giữa navigation bar và paperbuddy đang hơi bị sát
-> đồng thời check lại các cỡ chữ và vị trí chữ
2. Phần ảnh hình chữ nhật đầu tiên đang bị trống, tôi đã tạo thư mục images trong cùng thư mục lớn với những file html, cssv và javascript -> để ảnh là image1
3. Thanh search bar đang bị lỗi, sửa lại thanh search bar theo ảnh
4. Phần how it works nội dung bạn đang lấy từ savemyexams, còn 3 mục của tôi là
-> in-app past paper practice
-> AI grading and feedback
-> và outline generator
Hỏi nếu có gì chưa rõ


Prompt 4: Dashboard
Bây giờ đến trang tiếp theo, dashboard.html: trang dashboard. Đây là hình ảnh cho trang dashboard. Tôi sẽ làm rõ những phần còn trống
1. Cái thanh ở dưới past paper là thanh thể hiện progress (% số past paper đã làm)
2. Predicted grade được tạo dựa trên thành tích của những attempt trước đó
3. Khi ấn vào add/ edit subject, tôi không muốn nó dẫn đến trang mới nhưng tôi muốn một ô vuông như hình 2 hiện lên, và có thể ấn chọn/ bỏ chọn subject khác
4. Nếu add/ edit subject thành công, thì sẽ hiện thành một thanh trong ô my subject luôn
Hãy hỏi tôi nếu có phần gì chưa rõ
5. Khi ấn vào nút next (mũi tên chỉ sang bên phải), sẽ dẫn đến trang past paper của môn đó (ví dụ, của môn economics, thì ấn mũi tên vào sẽ sang trang past paper của economics)


Prompt 5: Past paper
ok tiếp theo là trang past paper, paper.html, tôi sẽ làm rõ những phần bỏ trống
1. Mỗi môn economics và business sẽ có trang past paper riêng
2. Ở phần filter có 4 thanh, status, year, session và paper no, tôi muốn filter theo dạng sẽ là thanh thả xuống và có option
-> ở status: done, not done
-> ở year: 2025, 2024, 2023
-> session: feb/march, may/jun, oct/nov
-> paper no.: 1, 2, 3, 4
3. Ở phía bên màn hình chính sẽ hiện past paper theo năm, nhưng tôi chưa rõ làm thế nào để hiện thị paper? tôi có nên lưu file gốc trên máy rồi refer hay tạo một paper.json hay để backend xử lý?

Prompt 6: Sửa lỗi Past paper
bây giờ chỉnh html thôi đã nhé,vẫn file paper.html này. Tôi sẽ clarify những thứ chưa rõ
1. cho mọi thứ tràn viền desktop chứ đừng bị bó vào như bây giờ
2. past paper các ô sẽ trải dài 3 năm, 2025, 2024, 2023
3. ở mỗi ô, hiển thị tên pastpaper, dựa trên paper sẽ được show trên backend
4. mỗi ô hiển thị done/ not done (có thể bằng chữ, hoặc tick, hoặc màu xanh/ trắng) tùy bạn cái nào bạn thấy phù hợp nhất
5. khi ấn vào paper đã done, dẫn đến attempt.html
6. khi nào ấn vào paper chưa done, dẫn đến test.html
hỏi nếu có gì chưa rõ trước khi tiếp tục

Prompt 7: Attempt
bây giờ code attempt.html nhé. tôi sẽ làm rõ những phần đang được để trống
1. Hình chữ nhật to nhất bên tay trái sẽ là để hiển thị past paper. Tôi không muốn nó kéo dài cả trang mà phải là past paper scroll được trong phạm vi chữ nhật đấy
2. Phần grade sẽ được hiển thị từ điểm chấm bằng AI
3. Chỗ có hai hình chữ nhật nhỏ hơn
-> Hình bên tay trái sẽ là Previous attempt & feedback
-> hình bên phải sẽ là outline
4. Hình chữ nhật nhỏ nhất sẽ là "Retake"button

Prompt 8: Test page
bây giờ code test.html. tôi sẽ làm rõ những phần còn trống
1. ô trên cùng là đồng hồ bấm giờ. 
2. Cái button trong đồng hồ bấm giờ ban đầu sẽ hiển thị là take exam. Sau khi ấn "Take exam" đồng hồ sẽ chạy, lúc này nút take exam sẽ đổi thành "Submit"
3. Sau khi làm xong bài, ấn "Submit" sẽ chuyển qua Result.html
4. hình chữ nhật to nhất bên tay trái sẽ giống như ở attempt.html, là một paper có thể scroll được
5. Ở bên tay phải có 2 hình chữ nhật
-> Hình nhỏ hơn ở bên trên là draft paper
-> Hình to hơn ở dưới sẽ là ô làm bài
6. Ở dưới, với user không làm bài trên app sẽ có lựa chọn "Drag file her or click to select"

Prompt 9: Result page
bây giờ nốt result.html. (giống hình 1). nội dung tham khảo hình 2

=> Follow up prompt sửa lỗi cho những phần còn lại

