var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	fs.readFile('./classrooms.json', 'utf8', function(err, data) {
		var classes = getSubjects(data);
		
		res.render('classrooms', {classes: classes});
	});
});

router.get('/:id', function(req, res, next) {
	fs.readFile('./classrooms.json', 'utf8', function(err, data) {
		var id = req.params.id;
		var classes = getSubjects(data);
		var studentsInClass = getStudentsByClass(data, id);

		res.render('class', {classes: classes, classId: id, students: studentsInClass});
	});
});

router.get('/:id/:sid', function(req, res, next) {
	fs.readFile('./classrooms.json', 'utf8', function(err, data) {
		var id = req.params.id;
		var sid = req.params.sid;
		var studentsInClass = getStudentsByClass(data, id);
		var currentStudent = getStudent(data, id, sid);

		res.render('student', {students: studentsInClass, sid: sid, student: currentStudent[0]});
	});
});

router.post('/:id/:sid', function(req, res, next) {
	fs.readFile('./classrooms.json', 'utf8', function(err, data) {
		var id = req.params.id;
		var sid = req.params.sid;
		var newScore = Number(req.body.score);
		var updated = addScore(data, id, sid, newScore);

		fs.writeFile('./classrooms.json', JSON.stringify(updated), 'utf-8', function(err) {
			if (err) throw err
		})

		res.render('success', {id: id, sid: sid});
	});
});





function getSubjects(data) {
	var obj = JSON.parse(data);
	var classes = {};
	for (var item of obj) {
		classes[item.id] = item.subject;
	}
	return classes;
}

function getStudentsByClass(data, id) {
	var obj = JSON.parse(data);
	var students = {};
	for (var item of obj) {
		if (item.id == id) {
			for (student in item.students) {
				students[student] = item.students[student].name;
			}
		}
	}
	return students;
}

function getStudent(data, id, sid) {
	var obj = JSON.parse(data);
	var currentStudent = [];
	for (var item of obj) {
		if (item.id == id) {
			for (student in item.students) {
				if (item.students[student].id == sid) {
					currentStudent.push(item.students[student])
				}
			}
		}
	}
	return currentStudent;
}

function addScore(data, id, sid, newScore) {
	var obj = JSON.parse(data);
	for (var item of obj) {
		if (item.id == id) {
			for (student in item.students) {
				if (item.students[student].id == sid) {
					item.students[student].scores.push(newScore);
					item.students[student].grade = getLetterGrade(item.students[student].scores)
				}
			}
		}
	}
	return obj;
}

function getLetterGrade(arr) {
	var average = arr.reduce(function(acc, val) {
		return acc + val;
	})/arr.length;
	if (average >= 90) {
		return "A";
	} else if (average >= 80) {
		return "B";
	} else if (average >= 70) {
		return "C";
	} else if (average >= 60) {
		return "D";
	} else {
		return "F";
	}
}
 

module.exports = router;
