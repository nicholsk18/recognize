class Recognition < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User"
  belongs_to :badge

  validates :message, presence: true
  after_create_commit -> { broadcast_append_to "recognitions", target: "recognitions-list" }
end
