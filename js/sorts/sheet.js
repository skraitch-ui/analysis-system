// sheet.js - МОДУЛЬ ДЛЯ ЛИСТА
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ЛИСТОВОГО ПРОКАТА
// ==========================================

const sheetModule = {
    sortType: 'sheet',

    showParameters: function() {
        console.log('🎯 [sheet.js] showParameters вызван');

        const paramsContent = document.getElementById('paramsContent');
        if (!paramsContent) {
            console.error('❌ Не найден paramsContent');
            return;
        }

        // Очищаем контейнер
        paramsContent.innerHTML = '';

        // 1. Проверяем что данные сортамента загружены
        if (!window.currentSortData || Object.keys(window.currentSortData).length === 0) {
            console.error('❌ Данные сортамента не загружены');
            paramsContent.innerHTML = '<div class="error">⚠️ Данные сортамента не загружены. Попробуйте выбрать снова.</div>';
            return;
        }

        // 2. Получаем выбранный материал
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            paramsContent.innerHTML = '<div class="error">⚠️ Сначала выбери материал</div>';
            return;
        }

        console.log('🔍 Проверяем данные для материала:', materialKey);
        console.log('📋 Данные sheet.json:', window.currentSortData);

        // 3. Проверяем есть ли материал ВООБЩЕ в данных sheet.json
        const hasMaterialInData = window.currentSortData.materials && window.currentSortData.materials[materialKey];
        console.log(`📊 Материал "${materialKey}" в sheet.json:`, hasMaterialInData ? '✅ Есть' : '❌ Нет');

        if (!hasMaterialInData) {
            paramsContent.innerHTML = `
                <div class="error">
                    ❌ Для материала <strong>${materialKey}</strong> нет данных по листам<br>
                    <small>Материал доступен для листа, но нет специфичных толщин в sheet.json</small>
                </div>
            `;
            return;
        }

        // 4. Берем толщины из данных материала
        const materialDataInSort = window.currentSortData.materials[materialKey];
        const thicknesses = materialDataInSort.thicknesses_mm || [];

        console.log('📏 Доступные толщины для листа:', thicknesses);

        // 5. Если толщин нет вообще - ошибка
        if (thicknesses.length === 0) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по толщинам для этого материала</div>';
            return;
        }

        // 6. Создаем select для толщины
        const thicknessDiv = document.createElement('div');
        thicknessDiv.className = 'param-group';
        thicknessDiv.innerHTML = `
            <label>Толщина листа (мм):</label>
            <select class="thickness-select param-select" id="sheetThicknessSelect">
                <option value="">-- Выбери толщину --</option>
                ${thicknesses.map(t => {
                    const displayValue = t.replace(',', '.');
                    return `<option value="${displayValue}">${displayValue} мм</option>`;
                }).join('')}
            </select>
        `;
        paramsContent.appendChild(thicknessDiv);

        // 7. Информация о способе изготовления
        const infoDiv = document.createElement('div');
        infoDiv.className = 'param-group';

        // Определяем способ изготовления
        const deliveryMethod = materialDataInSort.delivery_method || 'горячекатаный';
        const deliveryCondition = materialDataInSort.delivery_condition || 'термически обработанный';
        const accuracyClass = materialDataInSort.accuracy_classes?.[0] || 'Б';

        infoDiv.innerHTML = `
            <label>Характеристики поставки:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>Способ изготовления:</strong> ${deliveryMethod}<br>
                <strong>Состояние:</strong> ${deliveryCondition}<br>
                <strong>Точность:</strong> ${accuracyClass}
            </div>
        `;
        paramsContent.appendChild(infoDiv);

        // 8. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение листа';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 9. Показываем контейнер
        const paramsContainer = document.getElementById('paramsContainer');
        if (paramsContainer) {
            paramsContainer.style.display = 'block';
            console.log('✅ Контейнер параметров показан');
        } else {
            console.error('❌ Не найден paramsContainer');
        }

        console.log('✅ Параметры листа отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [sheet.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const thickness = document.querySelector('#sheetThicknessSelect')?.value;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем ввод
        if (!thickness) {
            alert('❌ Выбери толщину листа!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        // 3. Проверяем есть ли данные по материалу в sheet.json
        const hasMaterialInData = window.currentSortData.materials && window.currentSortData.materials[materialKey];
        if (!hasMaterialInData) {
            alert(`❌ Для материала "${materialKey}" нет данных по листам!`);
            return;
        }

        // 4. Формируем обозначение
        try {
            // Получаем данные материала
            const materialDataInSort = window.currentSortData.materials[materialKey];

            // Определяем способ изготовления
            const deliveryMethod = materialDataInSort.delivery_method || 'горячекатаный';

            // Стандарт
            const standard = window.currentSortData.standard_logic?.[deliveryMethod] || 'ГОСТ 19903-2015';

            // Точность
            const accuracyClass = materialDataInSort.accuracy_classes?.[0] || 'Б';

            // Суффикс группы
            const groupSuffix = window.currentSortData.group_suffix_logic?.[materialKey] || '';

            // Позиция группы (before, after, none)
            const groupPosition = window.currentSortData.group_position_logic?.[materialKey] || 'after';

            // Стандарт материала
            let materialStandard = window.currentSortData.material_standard_logic?.[materialKey];
            if (!materialStandard) {
                materialStandard = window.getMaterialStandard(materialKey, this.sortType);
            }

            // 5. ФОРМИРУЕМ ЗНАМЕНАТЕЛЬ С УЧЕТОМ ПОЗИЦИИ ГРУППЫ
            let denominator = '';

            if (groupPosition === 'before') {
                // Группа ПЕРЕД материалом: К350В-II-20
                // Убираем первый дефис из groupSuffix (например: "-К350В-II" → "К350В-II")
                const cleanGroupSuffix = groupSuffix.startsWith('-') ? groupSuffix.substring(1) : groupSuffix;
                denominator = `${cleanGroupSuffix}-${materialKey} ${materialStandard}`;
            } else if (groupPosition === 'after') {
                // Группа ПОСЛЕ материала: Ст3сп-ОК360В-IV
                denominator = `${materialKey}${groupSuffix} ${materialStandard}`;
            } else if (groupPosition === 'none') {
                // Без группы: 10880
                denominator = `${materialKey} ${materialStandard}`;
            } else {
                // По умолчанию - группа после
                denominator = `${materialKey}${groupSuffix} ${materialStandard}`;
            }

            // 6. Формируем числитель
            let numerator = `${accuracyClass}-${thickness} ${standard}`;

            // Очистка
            numerator = numerator.replace(/\s+/g, ' ').trim();
            denominator = denominator.replace(/\s{2,}/g, ' ').trim();

            // 7. Полное обозначение
            const fullDesignation = `Лист ${numerator}/${denominator}`;

            console.log('📝 Результат генерации листа:', {
                materialKey,
                thickness,
                standard,
                groupSuffix,
                groupPosition,
                numerator,
                denominator
            });

            // 8. Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                window.showDesignationResult(
                    'Лист',
                    numerator,
                    denominator,
                    fullDesignation
                );
            } else {
                alert('✅ Сгенерировано: ' + fullDesignation);
            }

        } catch (error) {
            console.error('❌ Ошибка генерации обозначения листа:', error);
            alert('Ошибка при генерации обозначения листа. Проверьте данные.');
        }
    }
};

// ==========================================
// 📦 РЕГИСТРАЦИЯ МОДУЛЯ
// ==========================================

window.sortModules = window.sortModules || {};
window.sortModules['sheet'] = sheetModule;