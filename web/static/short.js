// Система горячих клавиш для Groupie Tracker
document.addEventListener('keydown', function(event) {
    // Предотвращаем срабатывание в полях ввода
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return;
    }

    // Проверяем Ctrl (Windows/Linux) или Cmd (Mac)
    const isModifierPressed = event.ctrlKey || event.metaKey;

    // Ctrl/Cmd+K - Поиск (фокус на поле поиска)
    if (isModifierPressed && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // Ctrl/Cmd+Enter - Выполнить поиск
    if (isModifierPressed && event.key === 'Enter') {
        event.preventDefault();
        const searchForm = document.querySelector('form[method="get"]');
        if (searchForm) {
            searchForm.submit();
        }
    }

    // Escape - Очистить поиск и вернуться на главную
    if (event.key === 'Escape') {
        event.preventDefault();
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            window.location.href = '/';
        } else if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    // Ctrl/Cmd+Home - На главную страницу
    if (isModifierPressed && event.key === 'Home') {
        event.preventDefault();
        window.location.href = '/';
    }

    // Ctrl/Cmd+Backspace - Назад в истории браузера
    if (isModifierPressed && event.key === 'Backspace') {
        event.preventDefault();
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    // Стрелки для навигации по карточкам артистов (если они есть)
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const artistCards = document.querySelectorAll('.artist-card a');
        if (artistCards.length > 0) {
            event.preventDefault();
            const currentIndex = Array.from(artistCards).findIndex(card => 
                card === document.activeElement || card.contains(document.activeElement)
            );
            
            let nextIndex;
            if (event.key === 'ArrowRight') {
                nextIndex = currentIndex < artistCards.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : artistCards.length - 1;
            }
            
            artistCards[nextIndex].focus();
        }
    }

    // Enter - Перейти к выбранной карточке артиста
    if (event.key === 'Enter') {
        const focusedCard = document.querySelector('.artist-card a:focus');
        if (focusedCard) {
            event.preventDefault();
            window.location.href = focusedCard.href;
        }
    }

    // Специальные горячие клавиши для страницы артиста
    if (window.location.pathname.includes('/artist/')) {
        // Ctrl/Cmd+B - Назад к списку артистов
        if (isModifierPressed && event.key === 'b') {
            event.preventDefault();
            const backLink = document.querySelector('.back-home__link');
            if (backLink) {
                window.location.href = backLink.href;
            }
        }

        // Стрелки для навигации по концертам
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            const concertItems = document.querySelectorAll('.concert-list__item');
            if (concertItems.length > 0) {
                event.preventDefault();
                const currentIndex = Array.from(concertItems).findIndex(item => 
                    item === document.activeElement || item.contains(document.activeElement)
                );
                
                let nextIndex;
                if (event.key === 'ArrowDown') {
                    nextIndex = currentIndex < concertItems.length - 1 ? currentIndex + 1 : 0;
                } else {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : concertItems.length - 1;
                }
                
                concertItems[nextIndex].focus();
            }
        }

        // Ctrl/Cmd+C - Копировать информацию об артисте (только если не выделен текст)
        if (isModifierPressed && event.key === 'c') {
            const selection = window.getSelection();
            if (selection.toString().length === 0) {
                event.preventDefault();
                const artistName = document.querySelector('.artist-detail__title');
                const creationDate = document.querySelector('p:contains("Год создания")');
                const firstAlbum = document.querySelector('p:contains("Первый альбом")');
                
                let info = '';
                if (artistName) info += `Артист: ${artistName.textContent}\n`;
                if (creationDate) info += `${creationDate.textContent}\n`;
                if (firstAlbum) info += `${firstAlbum.textContent}\n`;
                
                if (info) {
                    navigator.clipboard.writeText(info).then(() => {
                        showNotification('Информация скопирована!');
                    }).catch(() => {
                        // Fallback для старых браузеров
                        const textArea = document.createElement('textarea');
                        textArea.value = info;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        showNotification('Информация скопирована!');
                    });
                }
            }
        }
    }

    // Ctrl/Cmd+F - Поиск по странице (стандартная функция браузера)
    if (isModifierPressed && event.key === 'f') {
        // Позволяем браузеру обработать стандартный поиск
        return;
    }

    // Ctrl/Cmd+R - Обновить страницу
    if (isModifierPressed && event.key === 'r') {
        // Позволяем браузеру обработать обновление
        return;
    }

    // Alt+? или Ctrl/Cmd+? - Показать справку по горячим клавишам
    if ((event.altKey || isModifierPressed) && event.key === '?') {
        event.preventDefault();
        showKeyboardShortcuts();
    }
});

// Функция для показа уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1001;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Показываем подсказки по горячим клавишам
function showKeyboardShortcuts() {
    const isArtistPage = window.location.pathname.includes('/artist/');
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? '⌘' : 'Ctrl';
    
    let shortcuts = [
        { key: `${modifierKey}+K`, description: 'Поиск артиста' },
        { key: `${modifierKey}+Enter`, description: 'Выполнить поиск' },
        { key: 'Escape', description: 'Очистить поиск / Назад' },
        { key: `${modifierKey}+Home`, description: 'На главную' },
        { key: `${modifierKey}+Backspace`, description: 'Назад в истории' }
    ];

    if (!isArtistPage) {
        shortcuts.push(
            { key: '←/→', description: 'Навигация по артистам' },
            { key: 'Enter', description: 'Открыть артиста' }
        );
    } else {
        shortcuts.push(
            { key: `${modifierKey}+B`, description: 'Назад к списку' },
            { key: '↑/↓', description: 'Навигация по концертам' },
            { key: `${modifierKey}+C`, description: 'Копировать информацию' }
        );
    }

    let helpText = `Горячие клавиши (${isMac ? 'Mac' : 'Windows/Linux'}):\n`;
    shortcuts.forEach(shortcut => {
        helpText += `${shortcut.key}: ${shortcut.description}\n`;
    });
    
    alert(helpText);
}

// Добавляем визуальные подсказки на страницу
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем подсказку в футер или в угол страницы
    const helpButton = document.createElement('div');
    helpButton.innerHTML = '?';
    helpButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: #007bff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: bold;
        font-size: 18px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    
    helpButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.background = '#0056b3';
    });
    
    helpButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.background = '#007bff';
    });
    
    helpButton.addEventListener('click', showKeyboardShortcuts);
    
    document.body.appendChild(helpButton);

    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});


window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  // 0.5 — регулирует угол (0.2—0.5—0.8—1.0)
  document.getElementById('diagonal')
          .style.transform = `translateX(${-scrollY * 0.8}px)`;
});
