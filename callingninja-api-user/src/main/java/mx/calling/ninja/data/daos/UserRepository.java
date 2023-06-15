package mx.calling.ninja.data.daos;

import mx.calling.ninja.data.model.Role;
import mx.calling.ninja.data.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository< User, Integer > {
    Optional< User > findByMobile(String mobile);

    Optional< User > findByEmail(String mobile);

    List< User > findByRoleIn(Collection< Role > roles);



//     @Query("update StudentXGroup iSxG set iSxG.deleteStatute = 1 where iSxG.groupId = ?1")
//     void updateByMobile(String mobile);

    
    @Transactional
    @Modifying
    @Query("update User u set u.company = :company,u.eyeColor = :eyeColor,u.age = :age,u.picture = :picture,u.balance = :balance,u.firstName = :firstName, u.lastName = :lastName, u.familyName = :familyName, u.email = :email,u.dni = :dni,u.address = :address,u.active = :active where u.mobile = :mobile")
    //void dinamicUpdate(String company,String eyeColor, int age,String picture,String balance,String firstName,String lastName,String email,String dni,String address,boolean active,String mobile);
    void dinamicUpdate(String company,String eyeColor, int age,String picture,String balance,String firstName,String lastName,String familyName,String email,String dni,String address,boolean active,String mobile);

// @Transactional
// @Modifying
// @Query("update User u set u.company = :company,u.eyeColor = :eyeColor,u.age = :age,u.picture = :picture where u.mobile = :mobile")
// void dinamicUpdate(String company,String eyeColor, int age,String picture,String mobile);





//     @Modifying
//     @Query("update Customer u set u.phone = :phone where u.id = :id")
//     void updatePhone(@Param(value = "id") long id, @Param(value = "phone") String phone);






    @Query("select u from User u where " +
            "(?1 is null or u.mobile like concat('%',?1,'%')) and " +
            "(?2 is null or lower(u.firstName) like lower(concat('%',?2,'%'))) and" +
            "(?3 is null or lower(u.familyName) like lower(concat('%',?3,'%'))) and" +
            "(?4 is null or lower(u.email) like lower(concat('%',?4,'%'))) and" +
            "(?5 is null or lower(u.dni) like lower(concat('%',?5,'%'))) and" +
            "(u.role in ?6)")
    List< User > findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
            String mobile, String firstName, String familyName, String email, String dni, Collection< Role > roles);
}
