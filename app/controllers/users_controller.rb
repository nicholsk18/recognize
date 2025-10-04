class UsersController < ApplicationController
  def index
    @users = User.order(:name)
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to users_path, notice: "User created" }
      end
    else
      @users = User.all
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("user-form", partial: "form", locals: { user: @user }), status: :unprocessable_entity }
        format.html { render :index, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to users_path, notice: "User deleted" }
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :password, :password_confirmation)
  end
end
