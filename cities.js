/**
 * Для выполнения задания нужно установить Node JS (делается быстро и просто)
 * 
 * 
 * Дан список городов. Код для их получения в переменную написан. Вам нужно написать программу, которая будет выполняться следующим образом:
 * node ./cities.js "all where %number%>5" - выведет все города из списка с полем number у объектов городов которые соответствуют условию (вместо number могут быть region и city)
 * 
 * первое слово указывает максимальное количиство или позицию (Для first и second выводится одна запись) - all - все, first - первый, last - последний, цифра - количество, например
 * node ./cities.js "3 where %number%>5" - выведет в консоль 3 записи
 * node ./cities.js "first where %number%>5" - выведет в консоль первую запись
 * 
 * если слова where нет, например:
 * node ./cities.js "all"
 * то вывод работает без фильтрации, в примере выше выведутся в консоль все города.
 * Для удобства разбора (парсинга) строки с запросом рекомендую использовать regex
 * если задан неверный запрос (в примере ниже пропущено слово where но присутствует условие) выводится ошибка: wrong query
 * node ./cities.js "all %number%>5"
 * 
 * Операции для запроса могут быть: больше (>), меньше (<), совпадает (=)
 * 
 * ОТВЕТ ВЫВОДИТЬ В КОНСОЛЬ И ПИСАТЬ В ФАЙЛ OUTPUT.JSON (каждый раз перезаписывая)
 */

//Путь к файлу с городами
const { log, warn } = console;

const LIST_OF_CITIES = "./cities.json";
const LIST_OF_CITIES_OUTPUT = "./output.json";

// Пакет node для чтения из файла
const fs = require("fs");

// тут мы получаем "запрос" из командной строки
const query = process.argv[2];

let cities = {};

// Чтение городов в переменную, запись в переменную производится в Callback-функции
fs.readFile(LIST_OF_CITIES, "utf8", (err, data) => {
    cities = data;
    cities = JSON.parse(cities);

    //** Структура для фильтрации */

    cityFilter = {
        //Объект для фильтрации
        cityQuery: {
            limit: "",
            field: "",
            comparison: "",
            comparisonValue: null
        },

        //разбираем команду и приводим к виду объекта фильтрации

        makeOutCommand: function (inputString) {

            console.log("Строка команды", inputString);
            const regPattern = /(first|all|last|\d*)\s\where\s?%(\w*)\%(>|<|=)([,.а-яА-ЯёЁ0-9\s]*)/;
            if (regPattern.test(inputString)) {
                this.cityQuery.limit = inputString.replace(regPattern, '$1');
                this.cityQuery.field = inputString.replace(regPattern, '$2');
                this.cityQuery.comparison = inputString.replace(regPattern, '$3');
                this.cityQuery.comparisonValue = inputString.replace(regPattern, '$4');
            } else {
                const regPattern2 = /(first|all|last|\d*)/;
                if (regPattern2.test(inputString)) {
                    this.cityQuery.limit = inputString.replace(regPattern2, '$1');
                } else {
                    console.log("Команда написана неверно");
                    throw error;
                }

            }
        },

        //выполняем фильтрацию

        performFilteging: function (cities) {

            //объект для выбора лимита
            limitCase = {
                'first': (cities) => { const filterCities = cities.splice(1); console.log("города", cities); return cities; },
                'all': (cities) => { console.log("города", cities); return cities },
                'last': (cities) => { console.log("города", cities); const filterCities = cities.splice(cities.length - 1); console.log(filterCities); return filterCities; }
            };

            //объект для выбора операции сравнения
            comparisonCase = {
                '=': (cities) => { return cities.filter(function (values) { return values[this.cityQuery.field] == this.cityQuery.comparisonValue }, this); },
                '>': (cities) => { return cities.filter(function (values) { return values[this.cityQuery.field] > this.cityQuery.comparisonValue }, this); },
                '<': (cities) => { return cities.filter(function (values) { return values[this.cityQuery.field] < this.cityQuery.comparisonValue }, this); }
            };

            //если есть поле сравнение, то сравниваем, иначе просто ставим лимит
            try {
                if (this.cityQuery.field != "") {
                    cities = comparisonCase[this.cityQuery.comparison](cities);
                }
                cities = limitCase[this.cityQuery.limit](cities);
                return cities;
            }
            catch (err) {
                console.log("Ошибка фильтрации");
                throw (err);
            }
        }
    };

    //Фильтруем данные    
    try {
        cityFilter.makeOutCommand(query);
        cities = cityFilter.performFilteging(cities);
        console.log(cities);


        //Записываем в файл

        fs.writeFile(LIST_OF_CITIES_OUTPUT, JSON.stringify(cities), (err) => {
            if (err) {
                console.log("Не удалось осуществить запись в файл", "Ошибка", err);
                throw (err);
            }
            console.log("Запись в файл завершена");
        });

    }
    catch (err) {
        console.log('Файл с данными не записан', "Ошибка", err);

    };




});




