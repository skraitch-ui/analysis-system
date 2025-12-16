// templates/template-module.js
// ==========================================
// 🎯 ШАБЛОН ДЛЯ СОЗДАНИЯ НОВЫХ МОДУЛЕЙ СОРТАМЕНТОВ
// ==========================================
// Копируй этот файл, меняй "template" на название сортамента
// и заполняй логику под конкретный тип проката
// ==========================================

const templateModule = {
    // 🎯 ОБЯЗАТЕЛЬНО: укажи правильный sortType (как в index.json)
    sortType: 'template', // ЗАМЕНИ на: round_bar, sheet, tube_round и т.д.

    // 📋 ФУНКЦИЯ ДЛЯ ПОКАЗА ПАРАМЕТРОВ
    showParameters: function() {
        console.log(`🎯 [${this.sortType}.js] showParameters вызван`);

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        // Очищаем контейнер
        paramsContent.innerHTML = '';

        // 🔍 ПРОВЕРКА ДАННЫХ
        if (!window.currentSortData || Object.keys(window.currentSortData).length === 0) {
            paramsContent.innerHTML = '<div class="error">⚠️ Данные сортамента не загружены</div>';
            return;
        }

        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            paramsContent.innerHTML = '<div class="error">⚠️ Сначала выбери материал</div>';
            return;
        }

        const materialData = window.currentSortData.materials?.[materialKey];
        if (!materialData) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных для этого материала</div>';
            return;
        }

        console.log(`📊 Материал "${materialKey}":`, materialData);
        console.log(`📋 Данные сортамента "${this.sortType}":`, window.currentSortData);

        // ==========================================
        // 🎨 ЗДЕСЬ СОЗДАВАЙ ПОЛЯ ДЛЯ ВЫБОРА ПАРАМЕТРОВ
        // ==========================================

        // 📌 ПРИМЕР 1: Выбор диаметра (для круглого прутка)
        // if (materialData.diameters_mm) {
        //     const diameterDiv = document.createElement('div');
        //     diameterDiv.className = 'param-group';
        //     diameterDiv.innerHTML = `
        //         <label>Диаметр (мм):</label>
        //         <select class="diameter-select param-select">
        //             <option value="">-- Выбери диаметр --</option>
        //             ${materialData.diameters_mm.map(d => `<option value="${d}">${d}</option>`).join('')}
        //         </select>
        //     `;
        //     paramsContent.appendChild(diameterDiv);
        // }

        // 📌 ПРИМЕР 2: Выбор толщины (для листа)
        // if (materialData.thicknesses_mm) {
        //     const thicknessDiv = document.createElement('div');
        //     thicknessDiv.className = 'param-group';
        //     thicknessDiv.innerHTML = `
        //         <label>Толщина (мм):</label>
        //         <select class="thickness-select param-select">
        //             <option value="">-- Выбери толщину --</option>
        //             ${materialData.thicknesses_mm.map(t => `<option value="${t}">${t}</option>`).join('')}
        //         </select>
        //     `;
        //     paramsContent.appendChild(thicknessDiv);
        // }

        // 📌 ПРИМЕР 3: Выбор класса точности
        // if (window.currentSortData.accuracy_classes) {
        //     const accuracyDiv = document.createElement('div');
        //     accuracyDiv.className = 'param-group';
        //     accuracyDiv.innerHTML = `
        //         <label>Класс точности:</label>
        //         <select class="accuracy-select param-select">
        //             <option value="">-- Выбери класс точности --</option>
        //             ${window.currentSortData.accuracy_classes.map(a => `<option value="${a}">${a}</option>`).join('')}
        //         </select>
        //     `;
        //     paramsContent.appendChild(accuracyDiv);
        // }

        // 📌 ПРИМЕР 4: Информационное поле (только чтение)
        // const infoDiv = document.createElement('div');
        // infoDiv.className = 'param-group';
        // infoDiv.innerHTML = `
        //     <label>Стандарт:</label>
        //     <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px;">
        //         <strong>${window.currentSortData.standard || 'ГОСТ не указан'}</strong>
        //     </div>
        // `;
        // paramsContent.appendChild(infoDiv);

        // ==========================================
        // 🎯 КНОПКА ГЕНЕРАЦИИ
        // ==========================================
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = `🎯 Сгенерировать обозначение ${window.currentSortData.product_name || 'изделия'}`;
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log(`✅ Параметры для "${this.sortType}" отображены`);
    },

    // 🔧 ФУНКЦИЯ ГЕНЕРАЦИИ ОБОЗНАЧЕНИЯ
    generateDesignation: function() {
        console.log(`🎯 [${this.sortType}.js] generateDesignation вызван`);

        // 🔍 ПРОВЕРКА МАТЕРИАЛА
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        // 🔍 ПРОВЕРКА ПАРАМЕТРОВ (пример)
        // const diameter = document.querySelector('.diameter-select')?.value;
        // const thickness = document.querySelector('.thickness-select')?.value;
        // const accuracy = document.querySelector('.accuracy-select')?.value;

        // if (!diameter) {
        //     alert('❌ Выбери диаметр!');
        //     return;
        // }

        try {
            // 📝 ПРИМЕР: Как получить данные материала
            const materialData = window.currentSortData.materials?.[materialKey];

            // 📝 ПРИМЕР: Как определить стандарт материала
            let materialStandard = window.currentSortData.material_standard_logic?.[materialKey];
            if (!materialStandard) {
                materialStandard = window.getMaterialStandard(materialKey, this.sortType);
            }

            // ==========================================
            // 🧱 ФОРМИРОВАНИЕ ОБОЗНАЧЕНИЯ
            // ==========================================

            // 📌 ПРИМЕР 1: Использование designation_components
            // let numerator = window.currentSortData.designation_components?.numerator
            //     .replace('{accuracy}', accuracy || '')
            //     .replace('{diameter}', diameter || '')
            //     .replace('{standard}', window.currentSortData.standard || 'ГОСТ');

            // let denominator = window.currentSortData.designation_components?.denominator
            //     .replace('{material}', materialKey)
            //     .replace('{material_standard}', materialStandard);

            // 📌 ПРИМЕР 2: Для сортаментов без дроби
            // const fullDesignation = window.currentSortData.example_designation
            //     .replace('{material}', materialKey)
            //     .replace('{size}', diameter || '')
            //     .replace('{standard}', window.currentSortData.standard || 'ГОСТ');

            // 📌 ПРИМЕР 3: Простая генерация (для начала)
            const numerator = `Параметры ${window.currentSortData.standard || 'ГОСТ'}`;
            const denominator = `${materialKey} ${materialStandard}`;
            const fullDesignation = `${window.currentSortData.product_name || 'Изделие'} ${numerator}/${denominator}`;

            // ==========================================
            // 📤 ВЫВОД РЕЗУЛЬТАТА
            // ==========================================
            console.log('📝 Результат генерации:', {
                materialKey,
                materialStandard,
                numerator,
                denominator,
                fullDesignation
            });

            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    window.currentSortData.product_name || 'Изделие',
                    numerator,
                    denominator,
                    fullDesignation
                );
            } else {
                alert('✅ Сгенерировано: ' + fullDesignation);
            }

        } catch (error) {
            console.error(`❌ Ошибка генерации для "${this.sortType}":`, error);
            alert('Ошибка при генерации обозначения. Проверьте данные.');
        }
    }
};

// ==========================================
// 📦 РЕГИСТРАЦИЯ МОДУЛЯ
// ==========================================

window.sortModules = window.sortModules || {};
window.sortModules[templateModule.sortType] = templateModule;

console.log(`✅ Модуль "${templateModule.sortType}" зарегистрирован (шаблон)`);
console.log('📋 Инструкция:');
console.log('1. Скопируй этот файл в папку js/sorts/');
console.log('2. Переименуй в имя_сортамента.js (например: plate.js)');
console.log('3. Замени "template" на имя сортамента в sortType');
console.log('4. Реализуй логику в showParameters() и generateDesignation()');
console.log('5. Добавь <script> в index.html');