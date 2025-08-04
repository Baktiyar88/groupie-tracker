package main

import (
	"groupie-tracker/internal/handlers"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/artist/", handlers.ArtistHandler)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			handlers.NotFoundHandler(w, r)
			return
		}
		handlers.HomeHandler(w, r)
	})

	// mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	switch r.URL.Path {
	// 	case "/artist/":
	// 		handlers.ArtistHandler(w, r)
	// 	case "/":
	// 		handlers.HomeHandler(w, r)
	// 	default:
	// 		if r.Method == http.MethodGet && r.URL.Path == "/" {
	// 			handlers.HomeHandler(w, r)
	// 		} else {
	// 			handlers.NotFoundHandler(w, r)
	// 		}
	// 	}
	// })

	fs := http.FileServer(http.Dir("./web/static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	log.Println("Server started on http://localhost:7777/")
	log.Fatal(http.ListenAndServe(":7777", mux))
}
