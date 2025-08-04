package handlers

import (
	"groupie-tracker/internal/data"
	"html/template"
	"net/http"
	"sort"
	"strconv"
	"strings"
)

// Error handler for rendering error pages
// This handler is used to render error pages with a consistent layout and style.
// It takes an HTTP response writer, an error code, a title, and a message to display.
type dataError struct {
	Code    int
	Title   string
	Message string
}

func renderError(w http.ResponseWriter, code int, title, message string) {
	tmpl, err := template.ParseFiles("web/templates/error.html")
	if err != nil {
		http.Error(w, "Template error", http.StatusInternalServerError)
		return
	}

	// Prepare data for the error template to execute
	var data dataError
	data.Code = code       // HTTP status code
	data.Title = title     // Title of the error page
	data.Message = message // Message to display on the error page

	w.WriteHeader(code)
	tmpl.Execute(w, data)
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		MethodNotAllowedHandler(w, r)
		return
	}
	artists, err := data.FetchArtists()
	if err != nil {
		renderError(w, 500, "Ошибка загрузки артистов", "Не удалось загрузить список артистов.")
		return
	}

	// Фильтрация
	search := r.URL.Query().Get("search")
	year := r.URL.Query().Get("year")
	var filtered []data.Artist
	yearsMap := map[int]struct{}{}
	for _, a := range artists {
		yearsMap[a.CreationDate] = struct{}{}
		if (search == "" || containsIgnoreCase(a.Name, search)) && (year == "" || itoa(a.CreationDate) == year) {
			filtered = append(filtered, a)
		}
	}
	var years []int
	for y := range yearsMap {
		years = append(years, y)
	}
	sort.Ints(years)

	tmpl, err := template.ParseFiles("web/templates/index.html")
	if err != nil {
		renderError(w, 500, "Ошибка шаблона", "Не удалось загрузить шаблон страницы.")
		return
	}
	tmpl.Execute(w, map[string]interface{}{
		"Artists": filtered,
		"Years":   years,
		"Search":  search,
		"Year":    year,
	})
}

func ArtistHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		MethodNotAllowedHandler(w, r)
		return
	}
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) != 3 || parts[1] != "artist" {
		NotFoundHandler(w, r)
		return
	}
	id, err := strconv.Atoi(parts[2])
	if err != nil {
		NotFoundHandler(w, r)
		return
	}

	artists, err := data.FetchArtists()
	if err != nil {
		renderError(w, 500, "Ошибка загрузки артиста", "Не удалось загрузить информацию об артисте.")
		return
	}
	var artist *data.Artist
	for _, a := range artists {
		if a.ID == id {
			artist = &a
			break
		}
	}
	if artist == nil {
		NotFoundHandler(w, r)
		return
	}

	relation, err := data.FetchRelation()
	if err != nil {
		renderError(w, 500, "Ошибка загрузки концертов", "Не удалось загрузить информацию о концертах артиста.")
		return
	}
	var datesLocations map[string][]string
	for _, rel := range relation.Index {
		if rel.ID == id {
			datesLocations = rel.DatesLocations
			break
		}
	}

	tmpl, err := template.ParseFiles("web/templates/artist.html")
	if err != nil {
		renderError(w, 500, "Ошибка шаблона", "Не удалось загрузить шаблон страницы артиста.")
		return
	}
	tmpl.Execute(w, map[string]interface{}{
		"Name":           artist.Name,
		"Image":          artist.Image,
		"CreationDate":   artist.CreationDate,
		"FirstAlbum":     artist.FirstAlbum,
		"Members":        artist.Members,
		"DatesLocations": datesLocations,
	})
}

func NotFoundHandler(w http.ResponseWriter, r *http.Request) {
	renderError(w, 404, "Страница не найдена", "Запрашиваемая страница не существует.")
}

func MethodNotAllowedHandler(w http.ResponseWriter, r *http.Request) {
	renderError(w, 405, "Метод не разрешён", "Запрошенный метод не поддерживается для этого ресурса.")
}

func containsIgnoreCase(s, substr string) bool {
	s = strings.ToLower(s)
	substr = strings.ToLower(substr)
	return strings.Contains(s, substr)
}

func itoa(i int) string {
	return strconv.Itoa(i)
}
