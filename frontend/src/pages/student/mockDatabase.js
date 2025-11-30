// Simple mock database for RegisterTutor flow
const tutors = [
  {
    tutorId: 't1',
    name: 'Nguyễn Văn A',
    subjects: ['Nguyên lý ngôn ngữ lập trình','Cơ sở dữ liệu'],
    rating: 4.8,
    students: '12/15',
    hk: 'HK101',
    code: 'HK101',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80',
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    tutorId: 't2',
    name: 'Trần Thị B',
    subjects: ['Cơ sở dữ liệu','Hệ điều hành'],
    rating: 4.6,
    students: '8/15',
    hk: 'HK251',
    code: 'HK251',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80',
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  {
    tutorId: 't3',
    name: 'Lê Thị C',
    subjects: ['Nguyên lý ngôn ngữ lập trình','Trí tuệ nhân tạo'],
    rating: 4.9,
    students: '5/15',
    hk: 'HK302',
    code: 'HK302',
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900&q=80',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    tutorId: 't4',
    name: 'Phạm Văn D',
    subjects: ['Cấu trúc dữ liệu','Lập trình hướng đối tượng'],
    rating: 4.5,
    students: '10/15',
    hk: 'HK210',
    code: 'HK210',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80',
    avatar: 'https://i.pravatar.cc/150?img=14'
  }
];

// Additional mock tutors to populate multiple pages
const moreTutors = [
  {
    tutorId: 't5', name: 'Lê Văn E', subjects:['Cơ sở dữ liệu'], rating:4.7, students:'6/15', hk:'HK111', code:'HK111', image:'https://images.unsplash.com/photo-1518733057094-95b5316a1b17?w=900&q=80', avatar:'https://i.pravatar.cc/150?img=6'
  },
  { tutorId: 't6', name: 'Bùi Thị F', subjects:['Nguyên lý ngôn ngữ lập trình'], rating:4.9, students:'3/15', hk:'HK120', code:'HK120', image:'https://images.unsplash.com/photo-1522205408450-add114ad53fe?w=900&q=80', avatar:'https://i.pravatar.cc/150?img=7' },
  { tutorId: 't7', name: 'Đỗ Văn G', subjects:['Cơ sở dữ liệu'], rating:4.2, students:'11/15', hk:'HK131', code:'HK131', image:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=900&q=80', avatar:'https://i.pravatar.cc/150?img=9' },
  { tutorId: 't8', name: 'Phan Thị H', subjects:['Hệ điều hành','Cơ sở dữ liệu'], rating:4.3, students:'4/15', hk:'HK141', code:'HK141', image:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80', avatar:'https://i.pravatar.cc/150?img=10' },
  { tutorId: 't9', name: 'Trịnh Văn I', subjects:['Cấu trúc dữ liệu'], rating:4.4, students:'9/15', hk:'HK151', code:'HK151', image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80', avatar:'https://i.pravatar.cc/150?img=11' },
  { tutorId: 't10', name: 'Hoàng Thị K', subjects:['Nguyên lý ngôn ngữ lập trình','Trí tuệ nhân tạo'], rating:4.95, students:'2/15', hk:'HK160', code:'HK160', image:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80', avatar:'https://i.pravatar.cc/150?img=13' }
];

export const allTutors = [...tutors, ...moreTutors];

export default allTutors;
