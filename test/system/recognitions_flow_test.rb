require "application_system_test_case"
require "securerandom"

class RecognitionsFlowTest < ApplicationSystemTestCase
  def setup
    @sender = User.create!(email: "sender-#{SecureRandom.hex(4)}@example.com", name: "Sender", password: "password", password_confirmation: "password")
    @recipient = User.create!(email: "recipient-#{SecureRandom.hex(4)}@example.com", name: "Recipient", password: "password", password_confirmation: "password")
    # Prefer existing fixture badge if present; otherwise create unique
    @badge = Badge.find_by(slug: "teamwork") || Badge.create!(name: "Team Player", slug: "team-player-#{SecureRandom.hex(4)}")
  end

  def login_as(user)
    visit login_path
    fill_in "email", with: user.email
    fill_in "password", with: "password"
    click_on "Login"
    assert_text "Logged in"
  end

  test "creating a recognition shows toast, closes modal, and highlights new item" do
    login_as(@sender)

    visit root_path
    click_on "Send Recognition"
    assert_selector "#recognition-modal.show"

    within "#recognition-modal" do
      select @recipient.name, from: "recognition_recipient_id", exact: true
      select @badge.name, from: "recognition_badge_id", exact: true
      fill_in "recognition_message", with: "Great work on the project!"
      click_on "Send"
    end

    # Toast appears
    assert_selector "#toast-container .toast", wait: 5

    # Modal closes
    assert_no_selector "#recognition-modal.show", wait: 5

    # New item is prepended and highlighted
    within "#recognitions-list" do
      assert_selector "li.list-group-item.highlight-new", wait: 5
      first_item_text = first("li.list-group-item").text
      assert_includes first_item_text, @sender.name
      assert_includes first_item_text, @recipient.name
      assert_includes first_item_text, @badge.name
    end
  end

  test "validation errors keep modal open and show inline errors" do
    login_as(@sender)

    visit root_path
    click_on "Send Recognition"
    assert_selector "#recognition-modal.show"

    within "#recognition-modal" do
      # Submit without selecting anything
      click_on "Send"
    end

    # Modal remains open
    assert_selector "#recognition-modal.show", wait: 5

    # Inline errors are shown
    assert_selector "#recognition-modal .invalid-feedback, #recognition-modal .alert-danger", wait: 5
  end
end
