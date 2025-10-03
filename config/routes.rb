Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get "/login", to: "sessions#new"
  post "/login", to: "sessions#create"
  delete "/logout", to: "sessions#destroy"

  resources :recognitions, only: [:index, :create, :destroy]
  root "recognitions#index"
end
