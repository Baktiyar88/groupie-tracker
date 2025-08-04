package data

import (
	"encoding/json"
	"net/http"
)

func FetchArtists() ([]Artist, error) {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/artists")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var artists []Artist
	err = json.NewDecoder(resp.Body).Decode(&artists)
	return artists, err
}

func FetchRelation() (Relation, error) {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/relation")
	if err != nil {
		return Relation{}, err
	}
	defer resp.Body.Close()
	var relation Relation
	err = json.NewDecoder(resp.Body).Decode(&relation)
	return relation, err
}
