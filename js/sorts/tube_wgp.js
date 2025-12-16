// tube_wgp.js - МОДУЛЬ ДЛЯ ТРУБ ВОДОГАЗОПРОВОДНЫХ (ВГП)
// ==========================================
// 📋 ГЕНЕРАЦИЯ ОБОЗНАЧЕНИЙ ДЛЯ ТРУБ ВГП
// ==========================================

const tubeWGPModule = {
    sortType: 'tube_wgp',

    showParameters: function() {
        console.log('🎯 [tube_wgp.js] showParameters вызван');

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

        // 3. Проверяем что материал есть в данных сортамента
        const materialData = window.currentSortData.materials?.[materialKey];
        if (!materialData || !materialData.sizes_mm) {
            paramsContent.innerHTML = '<div class="error">❌ Нет данных по размерам для этого материала</div>';
            return;
        }

        // 4. Размеры труб (диаметр × толщина стенки)
        const sizes = materialData.sizes_mm;
        console.log('📏 Размеры для материала', materialKey, ':', sizes);

        // Создаем select для размера
        const sizeDiv = document.createElement('div');
        sizeDiv.className = 'param-group';
        sizeDiv.innerHTML = `
            <label>Размер трубы (диаметр × толщина стенки, мм):</label>
            <select class="size-select param-select">
                <option value="">-- Выбери размер --</option>
                ${sizes.map(size =>
                    `<option value="${size.diameter}x${size.wall}" data-diameter="${size.diameter}" data-wall="${size.wall}">
                        Ø${size.diameter} × ${size.wall}
                    </option>`
                ).join('')}
            </select>
        `;
        paramsContent.appendChild(sizeDiv);

        // 5. Информация о стандарте
        const standardInfo = document.createElement('div');
        standardInfo.className = 'param-group';
        standardInfo.innerHTML = `
            <label>Стандарт на изделие:</label>
            <div style="padding: 8px; background: #f8f9fa; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${materialData.standard || 'ГОСТ 3262-75'}</strong>
                <br><small style="color: #666;">(Трубы водогазопроводные)</small>
            </div>
        `;
        paramsContent.appendChild(standardInfo);

        // 6. Информация о стандарте материала
        const materialStandardInfo = document.createElement('div');
        materialStandardInfo.className = 'param-group';
        materialStandardInfo.innerHTML = `
            <label>Стандарт материала:</label>
            <div style="padding: 8px; background: #f0f8ff; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>${materialData.material_standard || 'ГОСТ 380-2005'}</strong>
                <br><small style="color: #666;">(Сталь углеродистая обыкновенного качества)</small>
            </div>
        `;
        paramsContent.appendChild(materialStandardInfo);

        // 7. Техническая информация
        const techInfo = document.createElement('div');
        techInfo.className = 'param-group';
        techInfo.innerHTML = `
            <label>Технические характеристики:</label>
            <div style="padding: 8px; background: #fff8f0; border-radius: 4px; margin-top: 5px; font-size: 14px;">
                <strong>Печная сварка, обычная точность</strong><br>
                <small style="color: #666;">Без термической обработки, для водопровода и газопровода</small>
            </div>
        `;
        paramsContent.appendChild(techInfo);

        // 8. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение трубы';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 9. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры трубы ВГП отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [tube_wgp.js] generateDesignation вызван');

        // 1. Получаем выбранные значения
        const sizeSelect = document.querySelector('.size-select');
        if (!sizeSelect || !sizeSelect.value) {
            alert('❌ Выбери размер трубы!');
            return;
        }

        const diameter = sizeSelect.options[sizeSelect.selectedIndex].dataset.diameter;
        const wall = sizeSelect.options[sizeSelect.selectedIndex].dataset.wall;
        const materialKey = document.getElementById('materialSelect').value;

        // 2. Проверяем ввод
        if (!diameter || !wall) {
            alert('❌ Ошибка: не удалось получить размеры!');
            return;
        }

        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        // 3. Получаем данные материала
        const materialData = window.currentSortData?.materials?.[materialKey];
        if (!materialData) {
            alert('❌ Нет данных для выбранного материала!');
            return;
        }

        // 4. Формируем обозначение
        try {
            // 5. Формируем строку обозначения по example_designation из materialData
            // Формат: "Труба {diameter}*{wall} ГОСТ 3262-75"
            let fullDesignation = materialData.example_designation
                .replace(/{diameter}/g, diameter)
                .replace(/{wall}/g, wall)
                .replace(/{standard}/g, materialData.standard || '');

            // 6. Очистка и форматирование
            fullDesignation = fullDesignation
                .replace(/\s+/g, ' ') // убираем лишние пробелы
                .trim();

            console.log('📝 Результат генерации:', {
                materialKey,
                diameter,
                wall,
                fullDesignation
            });

            // 7. Показываем результат (недробный формат)
            if (typeof window.showDesignationResult === 'function') {
                const productName = 'Труба';
                window.showDesignationResult(
                    productName,
                    fullDesignation.replace(productName, '').trim(),
                    '', // пустой знаменатель для недробного формата
                    fullDesignation
                );
            } else {
                console.error('❌ Функция showDesignationResult не найдена!');
                alert('Ошибка: не удалось отобразить результат');
            }

        } catch (error) {
            console.error('❌ Ошибка генерации обозначения:', error);
            alert('Ошибка при генерации обозначения. Проверьте данные.');
        }
    }
};

// ==========================================
// 📦 РЕГИСТРАЦИЯ МОДУЛЯ
// ==========================================

if (!window.sortModules) window.sortModules = {};
window.sortModules['tube_wgp'] = tubeWGPModule;