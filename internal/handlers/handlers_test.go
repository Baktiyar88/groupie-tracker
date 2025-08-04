package handlers

import "testing"

func TestContainsIgnoreCase(t *testing.T) {
	if !containsIgnoreCase("Queen", "que") {
		t.Error("Expected true for substring match")
	}
	if containsIgnoreCase("Queen", "foo") {
		t.Error("Expected false for non-matching substring")
	}
}
