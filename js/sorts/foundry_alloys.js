// foundry_alloys.js - МОДУЛЬ ДЛЯ ЛИТЕЙНЫХ СПЛАВОВ (ФИНАЛЬНАЯ ВЕРСИЯ С ОТОБРАЖЕНИЕМ)
// ==========================================

const foundryAlloysModule = {
    sortType: 'foundry_alloys',

    showParameters: function() {
        console.log('🎯 [foundry_alloys.js] showParameters вызван');

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

        // 3. Определяем тип сплава по марке
        let alloyType = null;
        let alloyData = null;

        if (materialKey.startsWith('СЧ')) {
            alloyType = 'cast_iron';
            alloyData = window.currentSortData.alloy_types?.cast_iron;
        } else if (materialKey.endsWith('Л')) {
            alloyType = 'cast_steel';
            alloyData = window.currentSortData.alloy_types?.cast_steel;
        }

        if (!alloyType || !alloyData) {
            paramsContent.innerHTML = '<div class="error">❌ Этот материал не относится к литейным сплавам</div>';
            return;
        }

        console.log('🔍 Определен тип сплава:', { materialKey, alloyType, alloyName: alloyData.name });

        // 4. Для стали литейной - выбор группы отливок
        if (alloyType === 'cast_steel' && alloyData.casting_groups) {
            const groups = Object.entries(alloyData.casting_groups);

            const groupDiv = document.createElement('div');
            groupDiv.className = 'param-group';
            groupDiv.innerHTML = `
                <label>Группа отливок:</label>
                <select class="group-select param-select">
                    <option value="">-- Без группы --</option>
                    ${groups.map(([key, desc]) =>
                        `<option value="${key}">${key}-я группа (${desc})</option>`
                    ).join('')}
                </select>
            `;
            paramsContent.appendChild(groupDiv);
        }

        // 5. Кнопка генерации
        const button = document.createElement('button');
        button.className = 'generate-btn';
        button.innerHTML = '🎯 Сгенерировать обозначение';
        button.onclick = this.generateDesignation.bind(this);
        paramsContent.appendChild(button);

        // 6. Показываем контейнер
        document.getElementById('paramsContainer').style.display = 'block';
        console.log('✅ Параметры литейного сплава отображены для материала:', materialKey);
    },

    generateDesignation: function() {
        console.log('🎯 [foundry_alloys.js] generateDesignation вызван');

        // 1. Получаем выбранный материал
        const materialKey = document.getElementById('materialSelect').value;
        if (!materialKey) {
            alert('❌ Сначала выбери материал!');
            return;
        }

        // 2. Определяем тип сплава
        let alloyType = null;
        let alloyData = null;

        if (materialKey.startsWith('СЧ')) {
            alloyType = 'cast_iron';
            alloyData = window.currentSortData.alloy_types?.cast_iron;
        } else if (materialKey.endsWith('Л')) {
            alloyType = 'cast_steel';
            alloyData = window.currentSortData.alloy_types?.cast_steel;
        }

        if (!alloyData) {
            alert('❌ Не удалось определить тип литейного сплава!');
            return;
        }

        // 3. Для стали проверяем выбранную группу
        let selectedGroup = '';
        let groupDescription = '';
        if (alloyType === 'cast_steel') {
            const groupSelect = document.querySelector('.group-select');
            if (groupSelect && groupSelect.value) {
                selectedGroup = groupSelect.value;
                groupDescription = alloyData.casting_groups?.[selectedGroup] || '';
            }
        }

        // 4. Формируем обозначение
        try {
            // ОСНОВНОЕ обозначение (всегда просто марка + стандарт)
            const mainDesignation = `${materialKey} ${alloyData.standard}`.replace(/\s+/g, ' ').trim();

            // 5. Формируем дополнительную информацию (для стали с группой)
            let additionalInfo = '';
            if (alloyType === 'cast_steel' && selectedGroup) {
                additionalInfo = `Отливки ${selectedGroup}-й группы из стали ${materialKey} ${alloyData.standard}`;
            }

            console.log('📝 Результат генерации:', {
                materialKey,
                alloyType,
                selectedGroup,
                mainDesignation,
                additionalInfo
            });

            // 6. Показываем результат
            if (typeof window.showDesignationResult === 'function') {
                // Для литейных сплавов используем специальный формат отображения
                // с дополнительной информацией внизу

                // Создаем контейнер для результата с дополнительной информацией
                const resultContainer = document.getElementById('resultContainer');
                if (resultContainer) {
                    // Очищаем старый результат
                    resultContainer.innerHTML = '';
                    resultContainer.style.display = 'block';

                    // Основной блок с обозначением
                    const mainBlock = document.createElement('div');
                    mainBlock.className = 'designation-result';
                    mainBlock.style.cssText = `
                        background: white;
                        border: 2px solid #4CAF50;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: ${additionalInfo ? '10px' : '0'};
                        text-align: center;
                    `;

                    mainBlock.innerHTML = `
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333;">
                            Основное обозначение:
                        </div>
                        <div style="font-size: 24px; font-weight: bold; color: #2196F3; margin-bottom: 15px;">
                            ${mainDesignation}
                        </div>
                        <button onclick="window.copyToClipboard('${mainDesignation}')"
                                style="padding: 8px 20px; background: #4CAF50; color: white;
                                       border: none; border-radius: 4px; cursor: pointer;">
                            📋 Копировать основное обозначение
                        </button>
                    `;

                    resultContainer.appendChild(mainBlock);

                    // Если есть дополнительная информация - показываем отдельным блоком
                    if (additionalInfo) {
                        const infoBlock = document.createElement('div');
                        infoBlock.className = 'additional-info';
                        infoBlock.style.cssText = `
                            background: #f8f9fa;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            padding: 15px;
                            font-size: 14px;
                            color: #666;
                        `;

                        infoBlock.innerHTML = `
                            <div style="font-weight: bold; margin-bottom: 5px; color: #666;">
                                📝 Информация для технических требований:
                            </div>
                            <div style="margin-bottom: 10px; color: #333;">
                                ${additionalInfo}
                            </div>
                            <button onclick="window.copyToClipboard('${additionalInfo}')"
                                    style="padding: 6px 15px; background: #607D8B; color: white;
                                           border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                                📋 Копировать информацию для ТТ
                            </button>
                        `;

                        resultContainer.appendChild(infoBlock);
                    }
                }

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
window.sortModules['foundry_alloys'] = foundryAlloysModule;