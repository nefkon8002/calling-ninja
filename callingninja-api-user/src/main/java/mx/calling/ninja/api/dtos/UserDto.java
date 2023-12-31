package mx.calling.ninja.api.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import mx.calling.ninja.data.model.Role;
import mx.calling.ninja.data.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    //@NotNull
    //@NotBlank
    // @Pattern(regexp = Validations.TEN_DIGITS)
    private String mobile;
    @NotNull
    @NotBlank
    private String firstName;
    private String lastName;
    private String familyName;
    private String email;
    private String dni;
    private String address;
    private String password;
    private Role role;
    private Boolean active;
    private LocalDateTime registrationDate;
    private String company;
    private int id;
    private String guid;
    private String balance;
    private String picture;
    private int age;
    private String eyeColor;
    private String twilio_sid;
    private String twilio_auth;
   

    public UserDto(User user) {
        BeanUtils.copyProperties(user, this);
        this.password = "secret";
    }

    public static UserDto ofMobileFirstName(User user) {
        return UserDto.builder().mobile(user.getMobile()).firstName(user.getFirstName()).lastName(user.getLastName()).active(user.getActive()).email(user.getEmail()).registrationDate(user.getRegistrationDate()).twilio_sid(user.getTwilio_sid()).twilio_auth(user.getTwilio_auth()).role(user.getRole()).build();
    }

    public void doDefault() {
        if (Objects.isNull(password)) {
            password = UUID.randomUUID().toString();
        }
        if (Objects.isNull(role)) {
            this.role = Role.CUSTOMER;
        }
        if (Objects.isNull(active)) {
            this.active = true;
        }
    }

    public User toUser() {
        this.doDefault();
        User user = new User();
        BeanUtils.copyProperties(this, user);
        user.setPassword(new BCryptPasswordEncoder().encode(this.password));
        return user;
    }
}
