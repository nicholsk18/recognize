class Badge < ApplicationRecord
  has_many :recognitions, dependent: :restrict_with_error

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z_]+\z/ }
  validate :can_be_deleted, on: :destroy

  private

  def can_be_deleted
    if recognitions.any?
      errors.add(:base, "Cannot delete badge - it is being used by recognitions")
    end
  end
end
