// SCHEMA - BEGIN
const DATE_NOW1 = new Date(2022, 10, 5);

const DATE_NOW2 = new Date(2022, 10, 17);

const DATE_NOW3 = new Date(2022, 10, 27);

const Banner1 = {
	id: 1,
	impressions: 10000,
	dateStart: new Date(2022, 10, 1),
	dateStop: new Date(2022, 10, 30),
	img: 'https://th.bing.com/th/id/OIP.JN7eDlWX_YkRRxsAy7kj9AAAAA?w=186&h=180&c=7&r=0&o=5&pid=1.7',
};
const Banner2 = {
	id: 2,
	impressions: 8000,
	dateStart: new Date(2022, 10, 9),
	dateStop: new Date(2022, 10, 24),
	img: 'https://th.bing.com/th/id/OIP.Fc_ZlOK4ANifZJl08hNVZQAAAA?w=198&h=180&c=7&r=0&o=5&pid=1.7',
};
const Banner3 = {
	id: 3,
	impressions: 10000,
	dateStart: new Date(2022, 10, 5),
	dateStop: new Date(2022, 10, 19),
	img: 'https://th.bing.com/th/id/OIP.pCWjgbynatg4_rdQBFoiPwAAAA?w=216&h=180&c=7&r=0&o=5&pid=1.7',
};
const Banner4 = {
	id: 4,
	impressions: 10000,
	dateStart: new Date(2022, 10, 9),
	dateStop: new Date(2022, 10, 18),
	img: 'https://th.bing.com/th/id/OIP.6HMDbozq05PXmWtkdr0hegAAAA?w=211&h=180&c=7&r=0&o=5&pid=1.7',
};

const Advertiser1 = {
	id: 1,
	banners: [Banner1],
};
const Advertiser2 = {
	id: 2,
	banners: [Banner2],
};
const Advertiser3 = {
	id: 3,
	banners: [Banner3, Banner4],
};

const advPlace = {
	maxShowPowerPerDay: 20000,
	Advertisers: [Advertiser1, Advertiser2, Advertiser3],
};
// SCHEMA - END

function getAmountDays(begin, end) {
	let timeDifference = new Date(end) - new Date(begin);
	let daysDifference = timeDifference / (1000 * 60 * 60 * 24);
	return daysDifference;
}

function isShow(place, date) {
	let banners = [];
	let bannersCount = 0;
	for (let i = 0; i < place.Advertisers.length; i++) {
		// start - banners count
		for (let ii = 0; ii < place.Advertisers[i].banners.length; ii++) {
			bannersCount = bannersCount + 1;
		}
		// end - banners count
		for (let ii = 0; ii < place.Advertisers[i].banners.length; ii++) {
			if (
				date <= place.Advertisers[i].banners[ii].dateStop &&
				date >= place.Advertisers[i].banners[ii].dateStart
			) {
				bannersCount = bannersCount + 1;
				banners.push({
					id: place.Advertisers[i].banners[ii].id,
					impressions: place.Advertisers[i].banners[ii].impressions,
					showPerDay: 0,
					img: place.Advertisers[i].banners[ii].img,
					shows: 0,
					alreadyShown: getRestShows(
						place.Advertisers[i].banners[ii].impressions,
						date,
						place.Advertisers[i].banners[ii].dateStart,
						place.Advertisers[i].banners[ii].dateStop
					),
					ratio: 0,
					isShow: false,
					dateStart: place.Advertisers[i].banners[ii].dateStart,
					dateStop: place.Advertisers[i].banners[ii].dateStop,
				});
			}
		}
	}

	return timeLineBalancer(banners, date);
}

function init(place, date) {
	let array = [];
	if (localStorage.length === 0) {
		localStorage.setItem('array', JSON.stringify(isShow(place, date)));
		array = JSON.parse(localStorage.getItem('array'));
	} else {
		array = JSON.parse(localStorage.getItem('array'));
	}

	if (array.length > 0) {
		let tempBannerRandomArray = [];
		let bannerNow = [];
		tempBannerRandomArray = getBannerValueIndex(getRatioArray(array));
		bannerNow = array[tempBannerRandomArray[tempBannerRandomArray.length - 1]];
		// console.log(bannerNow);
		for (let i = 0; i < array.length; i++) {
			if (array[i].id === bannerNow.id) {
				array[i].shows = array[i].shows + 1;
				localStorage.setItem('array', JSON.stringify(array));
			}
			if (array[i].shows > array[i].showPerDay) {
				let newArray = array.filter((n) => n.id !== array[i].id);
				localStorage.setItem('array', JSON.stringify(newArray));
			}
		}
		const container = document.getElementById('container');
		container.innerHTML = `<div class="border border-slate-500 shadow-lg rounded-lg p-1"><img src="${bannerNow.img}" alt='${bannerNow.id}' class="rounded-lg"></div>`;

		const log = document.getElementById('log');
		let bannersLogArray = JSON.parse(localStorage.getItem('array'));
		let bannersLog = '';
		for (let i = 0; i < bannersLogArray.length; i++) {
			bannersLog += `<div>${bannersLogArray[i].id} - ${bannersLogArray[i].shows}</div>`;
			bannersLog += `<div>${'Limit: '} - ${
				bannersLogArray[i].showPerDay
			}</div>`;
		}
		log.innerHTML = `State: ` + bannersLog;
		const title = document.getElementById('title');
		title.innerHTML = `	<h1 class="font-mono text-3xl font-bold w text-center">
		Banner's rotation!</h1>`;
		setTimeout(function () {
			location.reload();
		}, 300);
	} else {
		localStorage.removeItem('array');
	}
}

function setImpressionsRatio(array) {
	array.sort((x, y) => x.impressions - y.impressions);
	let onePercent = array[array.length - 1].impressions * 0.01;
	for (let i = 0; i < array.length; i++) {
		let ratio = array[i].impressions / onePercent;
		array[i].ratio = ratio;
	}
	return array;
}

function setDayRatio(array) {
	let AmountShowPerDay = 0;
	for (let i = 0; i < array.length; i++) {
		AmountShowPerDay = AmountShowPerDay + array[i].showPerDay;
	}
	console.log(AmountShowPerDay);
	let onePercent = AmountShowPerDay * 0.01;
	for (let i = 0; i < array.length; i++) {
		array[i].ratio = array[i].showPerDay / onePercent;
	}
	console.log(array);
	return array;
}

function getRatioArray(array) {
	let tempArray = [];
	if (array) {
		for (let i = 0; i < array.length; i++) {
			tempArray[i] = array[i].ratio;
		}
		// console.log(tempArray);
		return tempArray;
	}
	return -1;
}

function getBannerValueIndex(ratioArray) {
	const max = ratioArray.reduce((accumulator, current) => {
		return accumulator + current;
	}, 0);

	const min = 1;
	let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
	let leftBorder = 0;
	let rightBorder = ratioArray[0];
	for (const { index, value } of ratioArray.map((value, index) => ({
		index,
		value,
	}))) {
		if (leftBorder < randomNumber && randomNumber <= rightBorder) {
			// console.log([value, index]);
			return [value, index];
		}

		leftBorder = leftBorder + ratioArray[index];
		rightBorder = rightBorder + ratioArray[index + 1];
	}

	return [-1, -1];
}

function timeLineBalancer(array, date) {
	let restOfTheDays = 0;
	let restOfTheShows = 0;
	let maxDate;
	let tempArray = array;
	tempArray.sort((x, y) => x.dateStop - y.dateStop);
	maxDate = tempArray[tempArray.length - 1].dateStop;
	restOfTheDays = getAmountDays(date, maxDate);
	for (let i = 0; i < tempArray.length; i++) {
		restOfTheShows =
			restOfTheShows + (tempArray[i].impressions - tempArray[i].alreadyShown);
	}
	for (let i = 0; i < tempArray.length; i++) {
		tempArray[i].showPerDay = Math.ceil(
			restOfTheShows / restOfTheDays / tempArray.length
		);
	}
	setDayRatio(tempArray);
	// return middle shows for all banners, rest of the days rest of the show with rate,
	return tempArray;
}

function getRestShows(impressions, dateNow, dateStart, dateStop) {
	let alreadyShown = 0;
	let restDays = 0;
	let allDays = 0;
	let middleShows = 0;
	restDays = getAmountDays(dateStart, dateNow);
	allDays = getAmountDays(dateStart, dateStop);
	middleShows = impressions / allDays;
	alreadyShown = middleShows * restDays;
	return Math.ceil(alreadyShown);
}

init(advPlace, DATE_NOW1);

// function getRandomInt(min, max) {
// 	return Math.floor(Math.random() * (max - min)) + min;
// }

// var data = {};
// var a;

// for (let i = 0; i < 100000; ++i) {
// 	a = getRandomInt(1, 50);

// 	if (typeof data[a] === 'undefined') {
// 		// first time initialize
// 		data[a] = 1;
// 	} else {
// 		data[a] = data[a] + 1;
// 	}
// }

// console.log(data);

// const test_1 = [40, 50, 50, 100];
// const test_2 = [10, 10, 10, 10, 10, 50];
// const test_3 = [50, 50];

// const test_all = [test_1];

// const results = [];

// console.log('TEST');

// test_all.forEach(function (value) {
// 	let test_result = [
// 		value,
// 		new Array(value.length).fill(0),
// 		new Array(value.length).fill(0),
// 	];
// 	for (let i = 0; i <= 999; i++) {
// 		let valueIndex = getBannerValueIndex(value);
// 		test_result[1][valueIndex[1]] = test_result[1][valueIndex[1]] + 1;
// 		test_result[2][valueIndex[1]] =
// 			(test_result[1][valueIndex[1]] / 1000) * 100;
// 	}

// 	console.log(test_result);
// });
