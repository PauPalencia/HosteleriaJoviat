const DEFAULT_STUDENT_PHOTO =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=60";
const DEFAULT_RESTAURANT_PHOTO =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=60";

export function getStudentPhoto(student) {
  return student?.PhotoURL || DEFAULT_STUDENT_PHOTO;
}

export function getRestaurantPhoto(restaurant) {
  return restaurant?.PhotoURL || restaurant?.ImageURL || DEFAULT_RESTAURANT_PHOTO;
}
